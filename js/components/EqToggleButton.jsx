import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';


const EqToggleButton = (props) => (
  <div
    id='equalizer-button'
    className={classnames({selected: props.equalizer})}
    onClick={props.handleClick}
  />
);

const mapStateToProps = (state) => ({
  equalizer: state.windows.equalizer
});

const mapDispatchToProps = (dispatch) => ({
  handleClick: () => dispatch({type: 'TOGGLE_EQUALIZER_WINDOW'})
});


module.exports = connect(mapStateToProps, mapDispatchToProps)(EqToggleButton);
