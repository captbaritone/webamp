import React from "react";
import run from "../maki-interpreter/interpreter";
import System from "../maki-interpreter/runtime/System";
import runtime from "../maki-interpreter/runtime";
import Variable from "./Variable";
import Value from "./Value";
import Command from "./Command";
import { useDropzone } from "react-dropzone";

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

function Wrapper() {
  const [maki, setMaki] = React.useState(null);
  const onDrop = React.useCallback(async acceptedFiles => {
    if (acceptedFiles.length !== 1) {
      alert("Only drop one file at a time");
      return;
    }
    const file = acceptedFiles[0];
    const arrayBuffer = await readFileAsArrayBuffer(file);
    setMaki(arrayBuffer);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div
      {...getRootProps()}
      style={{
        height: "100vh",
        width: "100vh",
        backgroundColor: isDragActive ? "yellow" : "white",
      }}
    >
      {maki == null ? (
        <>
          <h1 style={{ textAlign: "center" }}>
            Drop a .maki file here to debug
          </h1>
          <input {...getInputProps()} type="file" />
        </>
      ) : (
        <Debugger maki={maki} />
      )}
    </div>
  );
}

/*
async function fetchTestScript() {
  const response = await fetch(basicTestUrl);
  return response.arrayBuffer();
}
*/

const initialState = {
  variables: [],
  stack: [],
  commands: [],
  commandOffset: 0,
};

function Debugger({ maki }) {
  // This is all a huge disaster
  const getNextStepPromiseRef = React.useRef(null);
  const [next, setNext] = React.useState(() => {});
  const [breakPoints, setBreakpoints] = React.useState(new Set([2]));
  const [paused, setPaused] = React.useState(false);
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case "STEPPED":
        const { variables, commands, commandOffset, stack } = action;
        return {
          ...state,
          variables,
          commands,
          commandOffset,
          stack,
        };
      default:
        throw new Error("Unknown action type");
    }
  }, initialState);

  const { variables, stack, commands, commandOffset } = state;

  getNextStepPromiseRef.current = i => {
    if (!paused) {
      if (breakPoints.has(i)) {
        setPaused(true);
      } else {
        return;
      }
    }
    return new Promise((resolve, reject) => {
      // setState accepts a creator function, so we have to pass a function that returns our function.
      setNext(() => resolve);
    });
  };
  const system = new System();

  React.useEffect(() => {
    run({
      runtime,
      data: maki,
      system,
      logger: ({ i, stack, program }) => {
        const { variables, commands } = program;
        dispatch({
          type: "STEPPED",
          variables,
          commands,
          commandOffset: i,
          stack,
        });
        return getNextStepPromiseRef.current(i);
      },
    });
  }, []);

  React.useEffect(() => {
    function handler(e) {
      switch (e.key) {
        case ";":
          next();
          break;
        default:
        // console.log(e.key);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70% 30%",
        gridTemplateRows: "30% 70%",
        height: "100vh",
        gridTemplateAreas: `
            "commands stack"
            "commands variables"
            `,
      }}
    >
      <div style={{ gridArea: "commands", overflow: "scroll" }}>
        <button onClick={next}>Next</button>
        {paused ? (
          <button
            onClick={() => {
              setPaused(false);
              next();
            }}
          >
            Play
          </button>
        ) : (
          <button onClick={() => setPaused(true)}>Pause</button>
        )}
        <h2>Commands</h2>
        <table>
          <tbody>
            {commands != null &&
              commands.map((command, i) => (
                <tr
                  style={{
                    backgroundColor: i === commandOffset ? "pink" : "white",
                  }}
                  key={i}
                >
                  <td>
                    {breakPoints.has(i) ? (
                      <button
                        onClick={() => {
                          const newBreakPoints = new Set(breakPoints);
                          newBreakPoints.delete(i);
                          setBreakpoints(newBreakPoints);
                          if (commandOffset === i) {
                            next();
                          }
                        }}
                      >
                        Clear
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newBreakPoints = new Set(breakPoints);
                          newBreakPoints.add(i);
                          setBreakpoints(newBreakPoints);
                        }}
                      >
                        Pause
                      </button>
                    )}
                    {i}
                  </td>
                  <td>
                    <Command command={command} variables={variables} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ gridArea: "stack", overflow: "scroll" }}>
        <h2>Stack</h2>
        <table>
          <tbody>
            {stack != null &&
              stack.map((value, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>
                    <Value value={value} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ gridArea: "variables", overflow: "scroll" }}>
        <h2>Variables</h2>
        <table>
          <tbody>
            {variables != null &&
              variables.map((variable, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>
                    <Variable variable={variable} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Wrapper;
