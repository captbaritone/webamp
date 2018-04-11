// Get the max value from an array-like
const max = arr => arr.reduce((acc, val) => Math.max(acc, val));

function createAnalysers(source) {
  const { context } = source;
  const splitter = context.createChannelSplitter();
  const leftGain = context.createGain();
  const rightGain = context.createGain();
  const leftAnalyser = context.createAnalyser();
  const rightAnalyser = context.createAnalyser();

  source.connect(splitter);
  splitter.connect(leftGain, 0);
  splitter.connect(rightGain, 1);
  leftGain.connect(leftAnalyser);
  rightGain.connect(rightAnalyser);

  function destroy() {
    source.disconnect(splitter);
    splitter.disconnect();
    leftGain.disconnect();
    rightGain.disconnect();
  }

  return { left: leftAnalyser, right: rightAnalyser, destroy };
}

const POLL_INTERVAL = 20;
const MAX_CALLS = 100;

export default async function detectChannels(source) {
  return new Promise((resolve, reject) => {
    const analysers = createAnalysers(source);

    const dataArray = new Uint8Array(analysers.left.frequencyBinCount);
    let maxLeft = 0;
    let maxRight = 0;
    let calls = 0;

    const unsubscribe = () => {
      // eslint-disable-next-line no-use-before-define
      clearInterval(intervalHandle);
      analysers.destroy();
    };

    const intervalHandle = setInterval(() => {
      analysers.left.getByteFrequencyData(dataArray);
      maxLeft = Math.max(maxLeft, max(dataArray));
      analysers.right.getByteFrequencyData(dataArray);
      maxRight = Math.max(maxRight, max(dataArray));

      if (maxLeft > 0) {
        if (maxRight > 0) {
          resolve(2);
        } else {
          resolve(1);
        }
        unsubscribe();
      }

      if (calls >= MAX_CALLS) {
        reject();
        unsubscribe();
      }

      calls++;
    }, POLL_INTERVAL);
  });
}
