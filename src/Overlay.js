import { connect } from "react-redux";
import * as ActionCreators from "./redux/actionCreators";
import BaseOverlay from "./components/BaseOverlay";

const mapDispatchToProps = dispatch => ({
  closeModal() {
    dispatch(ActionCreators.closeModal());
  }
});
export default connect(null, mapDispatchToProps)(BaseOverlay);
