import React from 'react';
import Paper from '@material-ui/core/Paper'
import { CircularProgress } from '@material-ui/core';
import { Mask } from './masks';


interface ThumbnailProps {
  selected: number;
  onSelected: Function;
  masks: Array<Mask>;
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
            const {info, jpg} = mask
            return (
              <Thumbnail key={index} selected={this.selected === index} index={index} info={info} jpg={jpg} onSelected={this.props.onSelected}></Thumbnail>
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
  jpg: string
  onSelected: Function
  info: {
    title: string;
    scale: number;
    position: number[];
  }
}

interface ThumbState {
  loading: boolean,
  selected: boolean
}

class Thumbnail extends React.Component<ThumbProps, ThumbState> {
  constructor(props: ThumbProps) {
    super(props)
    this.state = {loading: false, selected: props.selected}
  }

  render() {
    return (
      <Paper
      className={`paper-div ${this.state.selected ? 'selected' : ''}`}
      // {...this.props.info.then(info => `key=${info.title}`)}
      key='title'
      onClick={() => { 
        this.setState({loading: true, selected: true})
        this.props.onSelected(this.props.index).then(() => this.setState({loading: false}))
      } }
    >
      <div className={this.state.loading && (this.props.index !== 0) ? '': 'hide'}> 
        <CircularProgress/>

      </div>
      <img src={this.props.jpg} alt="mask" />

    </Paper>
    )
  }
}