import React from 'react';
import {connect} from 'react-redux';

import {close} from '../actionCreators';


const Close = ({closeWinamp}) => (
  <div
    id='close'
    onClick={closeWinamp}
  />
);

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch, ownProps) => ({
  closeWinamp: () => dispatch(close(ownProps.mediaPlayer))
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Close);
