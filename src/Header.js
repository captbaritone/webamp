import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import * as Actions from "./redux/actionCreators";
import { useActionCreator, useWindowSize } from "./hooks";
import { ReactComponent as AlgoliaLogo } from "./searchByAlgoliaDarkbBackground.svg";
import algoliaLogoSmallUrl from "./searchByAlgoliaSmall.png";
import UploadButton from "./UploadButton";
import FeedbackIcon from "./components/icons/FeedbackIcon";
import AboutIcon from "./components/icons/AboutIcon";
import RandomIcon from "./components/icons/RandomIcon";

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

function useFocusOnSlash() {
  const [input, setInput] = useState(null);
  const feedbackFormOpen = useSelector(Selectors.getFeedbackFormOpen);

  useEffect(() => {
    if (input == null || feedbackFormOpen) {
      return;
    }
    const handler = (e) => {
      // slash
      if (e.keyCode === 191) {
        if (input !== document.activeElement) {
          input.focus();
          e.preventDefault();
        }
      }
    };
    window.document.addEventListener("keydown", handler);
    return () => {
      window.document.removeEventListener("keydown", handler);
    };
  }, [input, feedbackFormOpen]);

  return setInput;
}

function Header() {
  const searchQuery = useSelector(Selectors.getSearchQuery);
  // const scale = useSelector((state) => state.scale);
  const uploadViewOpen = useSelector(Selectors.getUploadViewOpen);

  const setSearchQuery = useActionCreator(Actions.searchQueryChanged);
  const showFeedbackForm = useActionCreator(Actions.showFeedbackForm);
  const requestRandomSkin = useActionCreator(Actions.requestedRandomSkin);
  const requestedAboutPage = useActionCreator(Actions.requestedAboutPage);
  const setInput = useFocusOnSlash();

  return (
    <div id="search">
      <h1>
        <a
          title="Home"
          href="/"
          onClick={(e) => {
            if (Utils.eventIsLinkClick(e)) {
              e.preventDefault();
              setSearchQuery(null);
            }
          }}
        >
          <span id="logo">{"🌩️"}</span>
          <span className="name">Winamp Skin Museum</span>
        </a>
      </h1>
      <span style={{ flexGrow: 1 }} />
      {uploadViewOpen || (
        <>
          <a
            href="https://www.algolia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              opacity: searchQuery ? 0.5 : 0,
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
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery || ""}
            placeholder={"Search..."}
            ref={setInput}
          />
          <button
            onClick={() => {
              requestRandomSkin();
            }}
            title="Random Skin"
            style={{
              paddingLeft: "0.2rem",
              paddingRight: "0.2rem",
            }}
          >
            <RandomIcon />
          </button>
          <button
            title="Feedback"
            onClick={() => {
              showFeedbackForm();
            }}
            style={{
              paddingLeft: "0.2rem",
              paddingRight: "0.2rem",
            }}
          >
            <FeedbackIcon />
          </button>
          <button
            title="About"
            onClick={() => {
              requestedAboutPage();
            }}
            style={{
              paddingLeft: "0.2rem",
              paddingRight: "0.2rem",
            }}
          >
            <AboutIcon />
          </button>
        </>
      )}
      <UploadButton />
    </div>
  );
}

export default Header;
