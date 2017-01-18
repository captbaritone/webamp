import React from 'react';
import {connect} from 'react-redux';

import {close} from '../actionCreators';


const Close = ({closeWinamp}) => (
  <div
    id='close'
    onClick={closeWinamp}
  />
);

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => ({
  closeWinamp: () => dispatch(close())
});

export default connect(mapStateToProps, mapDispatchToProps)(Close);
