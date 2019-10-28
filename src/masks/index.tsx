const names = [
  'wicked_cat',
  'clown',
  'iron_man',
  'spiderman',
  'tiger',
]

export interface Mask {
  gltf: string
  jpg: string
  info: {title: string, scale: number, position: Array<number>}
}

export default names.map(name => ({
  gltf : `/masks/${name}/${name}.gltf`,
  jpg  : require(`./${name}/object.png`),
  info : require(`./${name}/object.json`),
} as Mask))