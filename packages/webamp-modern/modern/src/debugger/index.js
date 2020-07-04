import React from "react";
import { run } from "../maki-interpreter/virtualMachine";
import System from "../runtime/System";
import runtime from "../runtime";
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

function backgroundColorFromMessageTitle(messageTitle) {
  switch (messageTitle) {
    case "Success":
      return "lightgreen";
    case "Fial":
      return "pink";
    default:
      return "none";
  }
}

function Wrapper() {
  const [maki, setMaki] = React.useState(null);
  const onDrop = React.useCallback(async (acceptedFiles) => {
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
        height: "100%",
        width: "100%",
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

// Given a generator and a handler function, returns a function `next` which,
// when called, will `.next` values off the generator and pass them to `handler`
// until `handler` returns `false`.
function useNextGeneratorValue(gen, handler) {
  return React.useMemo(() => {
    if (gen == null) {
      // TODO: Return null and disable the next button
      return () => {};
    }
    return () => {
      let ret = gen.next();
      while (!ret.done) {
        if (handler(ret.value) === false) {
          return;
        }
        ret = gen.next();
      }
    };
  }, [gen, handler]);
}

const initialState = {
  variables: [],
  stack: [],
  commands: [],
  commandOffset: 0,
  messages: [],
  paused: true,
};

function reducer(state, action) {
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
    case "GOT_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    case "PAUSE":
      return { ...state, paused: true };
    case "UNPAUSE":
      return { ...state, paused: false };

    default:
      throw new Error("Unknown action type");
  }
}

function Debugger({ maki }) {
  const [gen, setGen] = React.useState(null);
  const [breakPoints, setBreakpoints] = React.useState(new Set([]));
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { variables, stack, commands, commandOffset, messages, paused } = state;

  const system = React.useMemo(() => {
    const sys = new System();
    sys.messagebox = function (message, messageTitle, flag, notanymoreId) {
      dispatch({
        type: "GOT_MESSAGE",
        message: { message, messageTitle, flag, notanymoreId },
      });
    };
    return sys;
  }, [dispatch]);

  React.useEffect(() => {
    run({ runtime, data: maki, system, debugHandler: setGen });
  }, [maki, system]);

  const nextValue = React.useCallback(
    (value) => {
      dispatch({
        type: "STEPPED",
        variables: value.variables,
        commands: value.commands,
        commandOffset: value.i,
        stack: value.stack,
      });
      if (paused) {
        return false;
      }
      if (breakPoints.has(value.i)) {
        dispatch({ type: "PAUSE" });
        return;
      }

      return true;
    },
    [dispatch, paused, breakPoints]
  );

  const next = useNextGeneratorValue(gen, nextValue);

  // When we unpause, we should resume
  React.useEffect(() => {
    if (!paused) next();
  }, [next, paused]);

  // When we get a new generator, immediatly take the first step.
  React.useEffect(() => {
    next();
  }, [gen, next]);

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
            "messages stack"
            "commands variables"
            `,
      }}
    >
      <div style={{ gridArea: "messages", overflow: "scroll" }}>
        <h2>
          Messages{" "}
          <span style={{ backgroundColor: "lightgreen" }}>
            {
              messages.filter(({ messageTitle }) => messageTitle === "Success")
                .length
            }
          </span>
          /{messages.length}
        </h2>
        <table>
          <tbody>
            {messages.map(
              ({ message, messageTitle, flag, notanymoreId }, i) => {
                const backgroundColor = backgroundColorFromMessageTitle(
                  messageTitle
                );
                return (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>{message}</td>
                    <td style={{ backgroundColor }}>{messageTitle}</td>
                    <td>{flag}</td>
                    <td>{notanymoreId}</td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
      <div style={{ gridArea: "commands", overflow: "scroll" }}>
        <button onClick={next}>Next</button>
        {paused ? (
          <button onClick={() => dispatch({ type: "UNPAUSE" })}>Play</button>
        ) : (
          <button onClick={() => dispatch({ type: "PAUSE" })}>Pause</button>
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
