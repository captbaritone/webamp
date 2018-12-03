import React from "react";
import { connect } from "react-redux";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";

class Header extends React.Component {
  render() {
    return (
      <div id="search">
        <h1>
          <a
            href="/"
            onClick={e => {
              if (Utils.eventIsLinkClick(e)) {
                e.preventDefault();
                this.props.setSearchQuery(null);
              }
            }}
          >
            <span id="logo">{"🌩️"}</span>
            <span className="name">Winamp Skin Museum</span>
          </a>
        </h1>
        <span style={{ flexGrow: 1 }} />
        <input
          type="text"
          onChange={e => this.props.setSearchQuery(e.target.value)}
          value={this.props.searchQuery || ""}
          placeholder={"Search..."}
        />
        <button
          onClick={() => {
            this.props.requestRandomSkin();
          }}
        >
          Random
        </button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  searchQuery: Selectors.getSearchQuery(state)
});

const mapDispatchToProps = dispatch => ({
  setSearchQuery(query) {
    dispatch(Actions.searchQueryChanged(query));
  },
  requestRandomSkin() {
    dispatch(Actions.requestedRandomSkin());
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
