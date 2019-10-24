import React from 'react';
import experiences from './experiences';
import './App.css';
import backImg from './imgs/back.png'
import Paper from '@material-ui/core/Paper'
import masks from './masks';


interface ExperienceProps {
  onClick: Function
}

const Experience: React.FC<ExperienceProps> = (props) => {
  return (
    <div className="experience-div">
      { experiences.map(experience => (
        <div
          className="experience-div"
          key={experience.title}
        >
          <img className="experience-img" src={experience.image} alt={experience.title} onClick={() => props.onClick(experience.title)} />
          <div className="experience-title">
            { experience.title }
          </div>
        </div>
      )) }
    </div>
  );
}

interface AppState {
  overview: boolean
}


interface MaskExperienceProps {
  onBack: Function
}

interface MaskExperienceState {
  loadingProgress: number
  selectedIndex: number
}

class MaskExperience extends React.Component<MaskExperienceProps, MaskExperienceState> {
  constructor(props: MaskExperienceProps) {
    super(props);
    this.state = {selectedIndex: 0, loadingProgress: 0}
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({loadingProgress: 100})
    }, 1000)
  }

  onSelectObject(newIndex = 0) {
    console.log('object selected', newIndex)
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

  renderImages() {
    const { selectedIndex } = this.state
    return (
      <div className="thumbnails-div">
        <div className="scroll-div">
          { masks.map((mask, index: number) => {
            const {info, jpg, gltf} = mask
            return (
              <Paper
                className={`paper-div ${selectedIndex === index}`}
                // className={classnames('paper-div', { selected: selectedIndex === index })}
                {...info.then(info => `key=${info.title}`)}
                key='title'
                // onClick={() => this.onSelectObject(index)}
              >
                <img {...info.then(info => `src=${jpg}`)} alt="mask" />
              </Paper>
            )
          })
        }
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="experience-div">
        <canvas
          id="faceCanvas"
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
          { this.renderImages() }
        </div>
      </div>
    )
  }
}

class StartView extends React.Component<{}, AppState> {
  constructor(props: object) {
    super(props);
    this.state = { overview: true };
  }
  
  startExperience(key: string) {
    this.setState({overview: false})
  }

  backButton() {
    this.setState({overview: true})
  }
  
  render() {
    if (this.state.overview) {
      return (
        <div className="App">
        <header className="App-header">
          <h1>Halloween Masks</h1>
          <Experience onClick={(key: string) => this.startExperience(key)}/>
        </header>
      </div>
      )
    } else {
      return ( <MaskExperience onBack={() => this.backButton()}/> )
    }
  }
}

const App: React.FC = () => {
  return (
    <StartView />
  );
}

export default App
