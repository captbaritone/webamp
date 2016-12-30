import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';


const Shuffle = ({shuffle, toggleShuffle}) => (
  <div
    id='shuffle'
    className={classnames({selected: shuffle})}
    onClick={toggleShuffle}
  />
);
const mapStateToProps = (state) => state.media;
const mapDispatchToProps = (dispatch) => ({
  toggleShuffle: () => dispatch({type: 'TOGGLE_SHUFFLE'})
});
module.exports = connect(mapStateToProps, mapDispatchToProps)(Shuffle);
