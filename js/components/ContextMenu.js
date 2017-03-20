import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { close, setSkinFromFilename, openFileDialog } from "../actionCreators";

import { CLOSE_CONTEXT_MENU, TOGGLE_CONTEXT_MENU } from "../actionTypes";

import "../../css/context-menu.css";

const SKINS = [
  { file: "base-2.91.wsz", name: "<Base Skin>" },
  { file: "MacOSXAqua1-5.wsz", name: "Mac OSX v1.5 (Aqua)" },
  { file: "TopazAmp1-2.wsz", name: "TopazAmp" },
  { file: "Vizor1-01.wsz", name: "Vizor" },
  { file: "XMMS-Turquoise.wsz", name: "XMMS Turquoise " },
  { file: "ZaxonRemake1-0.wsz", name: "Zaxon Remake" }
];

class ContextMenu extends React.Component {
  componantWillMount() {
    // Clicking anywhere outside the context menu will close the window
    document.addEventListener("click", this.props.closeMenu);
  }

  componantWillUnmount() {
    document.removeEventListener("click", this.props.closeMenu);
  }

  render() {
    return (
      <div
        id="option"
        className={classnames({ selected: this.props.selected })}
        onClick={this.props.toggleMenu}
      >
        <ul id="context-menu">
          <li>
            <a
              href="https://github.com/captbaritone/winamp2-js"
              target="_blank"
            >
              Winamp2-js...
            </a>
          </li>
          <li className="hr"><hr /></li>
          <li id="context-play-file" onClick={this.props.openFileDialog}>
            Play File...
          </li>
          <li className="parent">
            <ul>
              <li id="context-load-skin" onClick={this.props.openFileDialog}>
                Load Skin...
              </li>
              <li className="hr"><hr /></li>
              {SKINS.map(skin => (
                <li
                  key={skin.file}
                  onClick={this.props.setSkin.bind(null, skin.file)}
                >
                  {skin.name}
                </li>
              ))}
            </ul>
            Skins
          </li>
          <li className="hr"><hr /></li>
          <li id="context-exit" onClick={this.props.close}>Exit</li>
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => state.contextMenu;
const mapDispatchToProps = (dispatch, ownProps) => ({
  close: () => dispatch(close()),
  closeMenu: () => dispatch({ type: CLOSE_CONTEXT_MENU }),
  toggleMenu: e => {
    dispatch({ type: TOGGLE_CONTEXT_MENU });
    e.stopPropagation();
  },
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput)),
  setSkin: filename => dispatch(setSkinFromFilename(filename))
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
