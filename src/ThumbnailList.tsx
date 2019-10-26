import React from 'react';
import Paper from '@material-ui/core/Paper'
import { CircularProgress } from '@material-ui/core';
import { Mask } from './masks';


interface ThumbnailProps {
  selected: number;
  onSelected: Function;
  masks: Array<Mask>;
  downloadObjects: Function;
}

interface ThumbnailState {
  cachedModels: Array<any>
  cachedTexture: unknown
}

export class ThumbnailList extends React.Component<ThumbnailProps, ThumbnailState> {
  selected: number;
  constructor(props: ThumbnailProps) {
    super(props)
    this.selected = props.selected
  }

  render() {
    return (
      <div className="thumbnails-div">
        <div className="scroll-div">
          { this.props.masks.map((mask, index: number) => {
            const {info, jpg, gltf} = mask
            return (
              <Thumbnail key={index} selected={this.selected === index} index={index} info={info} jpg={jpg} downloadObjects={this.props.downloadObjects}></Thumbnail>
            )
          })
        }
        </div>
      </div>
    )
  }
}

interface ThumbProps {
  index: number
  selected: boolean
  jpg: Promise<string>
  downloadObjects: Function
  info:  Promise<{
    title: string;
    scale: number;
    position: number[];
  }>
}

interface ThumbState {
  loading: boolean
}

class Thumbnail extends React.Component<ThumbProps, ThumbState> {
  constructor(props: ThumbProps) {
    super(props)
    this.state = {loading: false}
  }

  render() {
    return (
      <Paper
      className={`paper-div ${this.props.selected ? 'selected' : ''}`}
      {...this.props.info.then(info => `key=${info.title}`)}
      key='title'
      // onClick={() => this.props.onSelected(index)}
      onClick={() => { 
        this.setState({loading: true})
        this.props.downloadObjects(this.props.index).then(() => this.setState({loading: false}))
      } }
    >
      <div className={this.state.loading ? '': 'hide'}> 
        <CircularProgress/>
      </div>
      <img {...this.props.info.then(info => `src=${this.props.jpg}`)} alt="mask" />
    </Paper>
    )
  }
}