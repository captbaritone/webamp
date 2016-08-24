import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import DraggableWindow from './DraggableWindow.jsx';
import Band from './Band.jsx';
import EqOn from './EqOn.jsx';
import EqAuto from './EqAuto.jsx';
import EqGraph from './EqGraph.jsx';

import '../../css/equalizer-window.css';

class EqualizerWindow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: 'SET_FOCUSED_WINDOW', window: 'EQUALIZER'});
  }

  render() {
    const {doubled} = this.props.display;

    const className = classnames({
      window: true,
      selected: this.props.windows.focused === 'EQUALIZER',
      doubled
    });
    return <DraggableWindow handleClass='title-bar'>
      <div id='equalizer-window' className={className} onClick={this.handleClick}>
        <div className='equalizer-top title-bar' />
        <EqOn />
        <EqAuto />
        <EqGraph />
        <div id='presets' />
        <div id='preamp'>
          <Band band='preamp' />
        </div>
        <div id='band-60'>
          <Band band='band60' />
        </div>
        <div id='band-170'>
          <Band band='band170' />
        </div>
        <div id='band-310'>
          <Band band='band310' />
        </div>
        <div id='band-600'>
          <Band band='band600' />
        </div>
        <div id='band-1k'>
          <Band band='band1k' />
        </div>
        <div id='band-3k'>
          <Band band='band3k' />
        </div>
        <div id='band-6k'>
          <Band band='band6k' />
        </div>
        <div id='band-12k'>
          <Band band='band12k' />
        </div>
        <div id='band-14k'>
          <Band band='band14k' />
        </div>
        <div id='band-16k'>
          <Band band='band16k' />
        </div>
      </div>
    </DraggableWindow>;
  }
}

  module.exports = connect((state) => state)(EqualizerWindow);
