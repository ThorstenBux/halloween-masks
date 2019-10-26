import React from 'react';
import { ThumbnailList } from './ThumbnailList';
import backImg from './imgs/back.png'
import masks, { Mask }from './masks';
import * as JeelizThreejsHelper from 'facefilter/helpers/JeelizThreejsHelper'
import facefilter from 'facefilter/dist/jeelizFaceFilterES6'
import * as three from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { EquirectangularToCubeGenerator } from 'three/examples/jsm/loaders/EquirectangularToCubeGenerator'
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator'
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker'

interface MaskExperienceProps {
  onBack: Function
}

interface MaskExperienceState {
  loadingProgress: number
  selectedIndex: number
}

export class MaskExperience extends React.Component<MaskExperienceProps, MaskExperienceState> {
  camera: any
  canvasId: string = 'faceCanvas'
  CANVAS: any
  threeCamera: three.PerspectiveCamera = new three.PerspectiveCamera()
  maxFaces = 3
  cachedTexture!: three.Texture;
  cachedModels: Array<GLTF>;
  envMap: any;
  cameraFOV = 74;

  constructor(props: MaskExperienceProps) {
    super(props);
    this.state = {selectedIndex: 0, loadingProgress: 0}
    this.cachedModels = []

  }

  makeOcclusionObject(child: three.Mesh, multiply = 1) {
    // Cerate material for occlusion object
    const occlusionMaterial = new three.ShaderMaterial({
      vertexShader   : three.ShaderLib.basic.vertexShader,
      fragmentShader : 'precision lowp float;\n void main(void){\n gl_FragColor=vec4(1.,0.,0.,0.);\n }',
      uniforms       : three.ShaderLib.basic.uniforms,
      colorWrite     : false,
    })
    child.material = occlusionMaterial
    child.scale.multiplyScalar(multiply)
    child.renderOrder = -1   // render first
    child.castShadow = false
    child.receiveShadow = false
  }

  prepareModel(index: number) {
    const gltfObject = this.cachedModels[this.state.selectedIndex]
      gltfObject.scene.traverse((child) => {
        if (child instanceof three.Mesh) {
          if (child.name.includes('head')) {
            // this.shadowAndOcclusion(child)
          } else if (child.name === 'transparentOccluder') {
            // Drag mask things: Exclude this mesh from responding to click&drag events
            child.userData.occlusion = true  // This is to disable to click and drag on this object; used in addDragEventListener.js
            if (child.parent) {
              child.parent.userData.hasOcclusionChild = true // To only traverse the children if there is an occlusion object
            } 
            this.makeOcclusionObject(child)
          } else if (child.name === 'Mask') {
            (child.material as three.MeshStandardMaterial).side = three.FrontSide;
            (child.material as three.MeshStandardMaterial).envMap = this.envMap
            child.castShadow = true
          } else {
            (child.material as three.MeshStandardMaterial).envMap = this.envMap
            child.castShadow = true
          }
        }
      })
      gltfObject.scene.frustumCulled = false
      masks[index].info.then((info) => {
        gltfObject.scene.scale.multiplyScalar(info.scale)
        gltfObject.scene.position.set(info.position[0], info.position[1], info.position[2])
      })
      if (this.maxFaces > 1) {
        gltfObject.scenes = []
        for (let i = 0; i < this.maxFaces; i++) {
          gltfObject.scenes.push(gltfObject.scene.clone())
        }
      }
  }

  setupRenderer(threeStuffs: any) {
    // https://threejs.org/docs/#examples/en/loaders/GLTFLoader
    threeStuffs.renderer.gammaOutput = true
    threeStuffs.renderer.gammaFactor = 2.2
    threeStuffs.renderer.toneMapping = three.Uncharted2ToneMapping
    threeStuffs.renderer.toneMappingExposure = 0.8

    threeStuffs.renderer.shadowMap.enabled = true
    threeStuffs.renderer.shadowMap.type = three.PCFSoftShadowMap
  }

  setupLight(threeStuffs: any) {
    // add some light
    threeStuffs.scene.add(new three.AmbientLight(0x444444))

    const directionalLight = new three.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(0, 1, 3)
    directionalLight.castShadow = true
    threeStuffs.scene.add(directionalLight)

    // Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.right = 5
    directionalLight.shadow.camera.left = -5
    directionalLight.shadow.camera.top = 5
    directionalLight.shadow.camera.bottom = -5
    directionalLight.shadow.radius = 2
    directionalLight.shadow.bias = -0.0005
  }

  generateEnvMap(renderer: three.WebGLRenderer) {
    // Envmap lighting
    const cubeGenerator = new EquirectangularToCubeGenerator(
      this.cachedTexture, { resolution: 1024 }
    )
    const tex = cubeGenerator.update(renderer)

    const pmremGenerator = new PMREMGenerator(
      tex
    )
    pmremGenerator.update(renderer)

    const pmremCubeUVPacker = new PMREMCubeUVPacker(
      pmremGenerator.cubeLods
    )
    pmremCubeUVPacker.update(renderer)

    this.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture

    pmremGenerator.dispose()
    pmremCubeUVPacker.dispose()
  }

  initThreeScene(spec: any) {
    const threeStuffs = JeelizThreejsHelper.init(spec)
    // this.threeStuffs = threeStuffs
    // Generate envMap
    this.generateEnvMap(threeStuffs.renderer)
    this.onSelectObject()

    this.setupRenderer(threeStuffs)
    this.setupLight(threeStuffs)

    // CREATE THE CAMERA
    const aspecRatio  = spec.canvasElement.width / spec.canvasElement.height
    console.log('Resolutions (w/h): aspect', spec.canvasElement.width, spec.canvasElement.height, aspecRatio)
    const threeCamera = new three.PerspectiveCamera(this.cameraFOV, aspecRatio, 0.1, 100)
    return threeCamera
  }

  initFaceFilter(videoSettings: any) {
    console.log('VideoSettings', videoSettings)
    videoSettings.flipX = true
    facefilter.init({
      canvasId: this.canvasId,
      videoSettings,
      followZRot       : true,
      NNCpath          : 'jeeliz/',
      maxFacesDetected : this.maxFaces,
      animateDelay     : 0,
      onWebcamGet      : (camera: any) => {
        console.log(`Camera resolution w: ${camera.videoWidth} h: ${camera.videoHeight}`)
        this.camera = camera
      },
      callbackReady: (errCode: any, spec: any) => {
        if (errCode) {
          console.error(errCode)
          return
        }
        this.setState({ loadingProgress: 100 })
        facefilter.set_stabilizationSettings({
          translationFactorRange : [0.001, 0.003], // default [0.0015, 0.005]
          rotationFactorRange    : [0.002, 0.01], // default: [0.003, 0.02]
          qualityFactorRange     : [0.92, 0.98], // default: [0.9, 0.98]
          alphaRange             : [0.1, 1], // default: [0.05, 1]
        })
        console.log('INFO : JEEFACEFILTERAPI IS READY', facefilter)
        this.CANVAS = spec.canvasElement
        this.threeCamera = this.initThreeScene(spec)
      },
      callbackTrack: (detectState: any) => {
        JeelizThreejsHelper.render(detectState, this.threeCamera)
      }
    })
  }

  startJeeliz() {
    (window as any).JeelizResizer.size_canvas({
      canvasId: this.canvasId,
      isFullScreen : true,
      // isFlipY      : true,
      // overSamplingFactor : 1,  //this is only used if isFullScreen is set to false
      callback     : (isError: boolean, videoSettings: any) => {
        this.initFaceFilter(videoSettings)
      },
      onResize: () => {
        if (this.threeCamera) {
          this.threeCamera.aspect = this.CANVAS.width / this.CANVAS.height
          this.threeCamera.updateProjectionMatrix()
        }
      }
    })
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({loadingProgress: 100})
    }, 1000)
    this.startJeeliz()
  }

  onSelectObject(newIndex = 0) {
    console.log('object selected', newIndex)
    console.log('mask', masks[newIndex])
    this.setState({selectedIndex: newIndex})
    this.prepareModel(newIndex)

    // const gltfObject = window.cachedModels[newIndex]
    // if (this.state.selectedIndex >= 0) {
    //   window.addDragEventListener(undefined, canvasId, true)
    //   if (this.threeStuffs.faceObject) {
    //     this.threeStuffs.faceObject.remove(window.cachedModels[this.state.selectedIndex].scene)
    //   } else {
    //     this.threeStuffs.faceObjects.forEach((faceObject, index) => {
    //       faceObject.remove(window.cachedModels[this.state.selectedIndex].scenes[index])
    //     })
    //   }
    // }
    // this.setState({ selectedIndex: newIndex })

    // // Dispatch the model
    // if (this.threeStuffs.faceObject) {
    //   this.threeStuffs.faceObject.add(gltfObject.scene)
    //   window.addDragEventListener(gltfObject.scene, canvasId)
    // } else {
    //   window.addDragEventListener(gltfObject.scenes, canvasId)
    //   this.threeStuffs.faceObjects.forEach((faceObject, index) => {
    //     faceObject.add(gltfObject.scenes[index])
    //   })
    // }
  }

  loadHDRTexture() {
    return new Promise<three.Texture>((resolve) => {
      const loader = new RGBELoader().setPath(`/objects/`)
      loader.load('adams_place_bridge_1k.hdr', (texture) => {
        texture.encoding  = three.RGBEEncoding
        texture.minFilter = three.NearestFilter
        texture.magFilter = three.NearestFilter
        texture.flipY     = true

        resolve(texture)
      })
    })
  }

  downloadObject(objectData: Mask): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load(
        objectData.gltf,
        (model) => {
          model.scene.traverse((child) => {
            if(child instanceof three.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          resolve(model)
        },
        (xhr)   => { console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`) },
        (error) => {
          console.log('An error happened', error)
          reject(error)
        }
      )
    })
  }

  async downloadObjects(index: number) {
    // load HDR texture
    this.cachedTexture = await this.loadHDRTexture()
    // if (!this.isActive) {
    //   return
    // }

    // load 3D objects
    if (!this.cachedModels[index]) {
      this.cachedModels[index] = await this.downloadObject(masks[index])
    }
    // if (!this.isActive) {
    //   return
    // }

    // this.startJeeliz()
  }

  render() {
    const { selectedIndex } = this.state
    return (
      <div className="experience-div">
        <canvas
          id={this.canvasId}
        />
        <div className="left-buttons-div">
          <div className="button-div" onClick={() => this.props.onBack()}>
            <img src={backImg} alt="a" />
          </div>
        </div>
        {/* Loading screen */}
        <div
          className={`loading-div ${this.state.loadingProgress >= 100 ? 'hide' : ''}`}
        >
          <p> Loading... </p>
          <div className="progress-container-div">
            <div style={{ width: `${this.state.loadingProgress}%` }} />
          </div>
        </div>
        {/* Render carusell */}
        <div className="footer-div">
          <ThumbnailList selected={selectedIndex} onSelected={this.onSelectObject} downloadObjects={this.downloadObjects} masks={masks}/>
        </div>
      </div>
    )
  }
}