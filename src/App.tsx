import React from 'react';
import experiences from './experiences';
import { MaskExperience } from './MaskExperience';
import './App.css';

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
