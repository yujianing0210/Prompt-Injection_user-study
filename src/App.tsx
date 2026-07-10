import { useState } from "react";
import { AppV1 } from "./AppV1";
import { AppV2 } from "./AppV2";

type StudyVersion = "v1" | "v2";

function App() {
  const [activeVersion, setActiveVersion] = useState<StudyVersion>("v1");

  return (
    <div className="app-shell">
      <nav className="version-tabs" aria-label="Study version">
        <button
          type="button"
          className={
            activeVersion === "v1"
              ? "version-tabs__tab version-tabs__tab--active"
              : "version-tabs__tab"
          }
          onClick={() => setActiveVersion("v1")}
        >
          Version 1
        </button>
        <button
          type="button"
          className={
            activeVersion === "v2"
              ? "version-tabs__tab version-tabs__tab--active"
              : "version-tabs__tab"
          }
          onClick={() => setActiveVersion("v2")}
        >
          Version 2
        </button>
      </nav>

      <div className="app-shell__content">
        {activeVersion === "v1" ? <AppV1 /> : <AppV2 />}
      </div>
    </div>
  );
}

export default App;
