import * as React from "react";
import { connect } from "react-redux";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import Disposable from "./Disposable";
import { useWindowSize } from "./hooks";
import { ReactComponent as AlgoliaLogo } from "./searchByAlgoliaDarkbBackground.svg";
import algoliaLogoSmallUrl from "./searchByAlgoliaSmall.png";
import { SHOW_UPLOAD } from "./constants";
import UploadButton from "./UploadButton";

function SearchLogo() {
  const { windowWidth } = useWindowSize();
  if (windowWidth > 500) {
    return <AlgoliaLogo />;
  }
  return (
    <img
      alt="Search by Algolia"
      style={{ width: 25, height: 25, paddingTop: 4 }}
      src={algoliaLogoSmallUrl}
    />
  );
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    this._inputRef = null;
  }

  componentDidMount() {
    const handler = (e) => {
      // slash
      if (e.keyCode === 191) {
        if (this._inputRef == null) {
          return;
        }
        if (this._inputRef !== document.activeElement) {
          this._inputRef.focus();
          e.preventDefault();
        }
      }
    };
    window.document.addEventListener("keydown", handler);
    this._disposable.add(() => {
      window.document.removeEventListener("keydown", handler);
    });
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }
  render() {
    return (
      <div id="search">
        <h1>
          <a
            href="/"
            onClick={(e) => {
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
        {this.props.uploadViewOpen || (
          <>
            <a
              href="https://www.algolia.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                opacity: this.props.searchQuery ? 0.5 : 0,
                transition: "opacity ease-in 300ms",
              }}
            >
              <SearchLogo />
            </a>
            {/*
        <button
          onClick={() => {
            this.props.setScale(this.props.scale + 0.1);
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            this.props.setScale(this.props.scale - 0.1);
          }}
        >
          -
        </button>
        */}
            <input
              type="search"
              style={{ marginLeft: 10 }}
              onChange={(e) => this.props.setSearchQuery(e.target.value)}
              value={this.props.searchQuery || ""}
              placeholder={"Search..."}
              ref={(node) => {
                this._inputRef = node;
              }}
            />
            <button
              onClick={() => {
                this.props.requestRandomSkin();
              }}
            >
              Random
            </button>
            <button
              onClick={() => {
                this.props.requestedAboutPage();
              }}
            >
              ?
            </button>
          </>
        )}
        <UploadButton />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchQuery: Selectors.getSearchQuery(state),
  scale: state.scale,
  uploadViewOpen: state.uploadViewOpen,
});

const mapDispatchToProps = (dispatch) => ({
  setSearchQuery(query) {
    dispatch(Actions.searchQueryChanged(query));
  },
  requestRandomSkin() {
    dispatch(Actions.requestedRandomSkin());
  },
  requestedAboutPage() {
    dispatch(Actions.requestedAboutPage());
  },
  setScale(scale) {
    dispatch({ type: "SET_SCALE", scale });
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Header);
