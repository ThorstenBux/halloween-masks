import React from 'react';
import experiences from './experiences';
import { MaskExperience } from './MaskExperience';
import './App.css';
import { GCALoggingService } from './GCALoggingService';

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
          <img className="experience-img" src={experience.image} alt={experience.title} onClick={() => props.onClick(experience.title, experience.path)} />
          <div className="experience-title">
            { experience.title }
          </div>
        </div>
      )) }
    </div>
  );
}

interface AppState {
  overview: boolean,
  path: string,
}

class StartView extends React.Component<{}, AppState> {
  constructor(props: object) {
    super(props);
    this.state = { overview: true, path: '' };
    const gcaLoggingService = new GCALoggingService();
    gcaLoggingService.log({});
  }
  
  startExperience(key: string, path: string) {
    this.setState({overview: false, path: path})
  }

  backButton() {
    window.location.reload();
    // this.setState({overview: true})
  }
  
  render() {
    if (this.state.overview) {
      return (
      <div className="App">
        <header className="App-header">
          <h1>Halloween Masks</h1>
          <Experience onClick={(key: string, path: string) => this.startExperience(key, path)}/>
        </header>
        <div className="footer">
          <div className="credits"><a href="./credits.html">Credits</a></div>
          <div className="poweredBy"><a href="https://tripod-digital.co.nz"><img src="./Tripod_pb.png" alt="Tripod digital logo" height="100"></img></a></div>
        </div>
      </div>
      )
    } else {
      return ( <MaskExperience onBack={() => this.backButton()} path={this.state.path}/> )
    }
  }
}

const App: React.FC = () => {
  return (
    <StartView />
  );
}

export default App
