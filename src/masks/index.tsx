const names = [
  'bear'
]

export interface Mask {
  gltf: string
  jpg: Promise<string>
  info: Promise<{title: string, scale: number, position: Array<number>}>
}

export default names.map(name => ({
  // gltf : `/masks/${name}/${name}.gltf`,
  // jpg  : import(`./${name}/object.jpg`),
  info : import(`./${name}/object.json`),
} as Mask))