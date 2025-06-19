import { useEffect, useState, type ReactNode } from "react";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

let Webamp: typeof import("webamp").default | undefined;
if (ExecutionEnvironment.canUseDOM) {
  Webamp = require("webamp");
}

function WebampComponent(): ReactNode {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref || !Webamp) {
      return;
    }
    const webamp = new Webamp({
      initialTracks: [
        {
          metaData: {
            artist: "DJ Mike Llama",
            title: "Llama Whippin' Intro",
          },
          url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
          duration: 5.322286,
        },
        {
          metaData: {
            artist: "Some Artist",
            title: "Title of Second Track",
          },
          url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
          duration: 5.322286,
        },
      ],
    });
    webamp.renderWhenReady(ref);

    return () => {
      // Cleanup Webamp instance when the component unmounts
      webamp.dispose();
    };
  }, [ref]);

  return <div ref={setRef} style={{ height: "400px", width: "100%" }}></div>;
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <BrowserOnly>{() => <WebampComponent />}</BrowserOnly>
        </div>
      </div>
    </section>
  );
}
