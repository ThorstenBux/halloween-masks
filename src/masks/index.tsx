const names = [
  'bear',
  'iron_man'
]

export interface Mask {
  gltf: string
  jpg: Promise<string>
  info: Promise<{title: string, scale: number, position: Array<number>}>
}

export default names.map(name => ({
  gltf : `/masks/${name}/${name}.gltf`,
  jpg  : import(`./${name}/object.png`),
  info : import(`./${name}/object.json`),
} as Mask))