import * as Actions from "./redux/actionCreators";
import React, {
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { useActionCreator } from "./hooks";

function handleTouchMove(e) {
  e.preventDefault();
}

function Overlay({ shouldAnimate, children }) {
  const closeModal = useActionCreator(Actions.closeModal);
  const [mounted, setMounted] = useState();

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    });
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      if (timeout != null) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const handleClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Esc
      if (e.keyCode === 27) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    window.document.addEventListener("keydown", handleKeyDown);
    window.document.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.document.removeEventListener("keydown", handleKeyDown);
      window.document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleKeyDown]);

  return ReactDOM.createPortal(
    <div
      style={{
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor:
          !shouldAnimate || mounted
            ? "rgba(0, 0, 0, 0.95)"
            : "rgba(0, 0, 0, 0)",
        transition: "background-color 400ms ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          // This one werid hack to work around margin collapse which was making
          // children with top margins cause the top protion of the overlay to
          // be unclickable: https://stackoverflow.com/a/47351270/1263117
          display: "flex",
          flexDirection: "column",
        }}
        onClick={handleClick}
        onScroll={handleTouchMove}
      >
        <a
          id="close-modal"
          href="/"
          onClick={(e) => {
            closeModal();
            e.preventDefault();
          }}
          aria-label="Close Modal"
          style={{
            color: "#a7a394",
            position: "fixed",
            top: 10,
            right: 10,
            padding: 0,
            fontSize: 50,
            lineHeight: "25px",
            textDecoration: "none",
          }}
        >
          &times;
        </a>
        {children}
      </div>
    </div>,
    window.document.body
  );
}

export default Overlay;
