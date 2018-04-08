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

  return { left: leftAnalyser, right: rightAnalyser };
}

const MAX_CALLS = 1000;

export default async function detectChannels(source) {
  return new Promise((resolve, reject) => {
    const { left, right } = createAnalysers(source);

    const dataArray = new Uint8Array(left.frequencyBinCount);
    let maxLeft = 0;
    let maxRight = 0;
    let calls = 0;
    const intervalHandle = setInterval(() => {
      left.getByteFrequencyData(dataArray);
      maxLeft = Math.max(maxLeft, max(dataArray));
      right.getByteFrequencyData(dataArray);
      maxRight = Math.max(maxRight, max(dataArray));

      if (maxLeft > 0) {
        if (maxRight > 0) {
          resolve(2);
        } else {
          resolve(1);
        }
        clearInterval(intervalHandle);
      }

      if (calls >= MAX_CALLS) {
        reject();
      }

      calls++;
    }, 20);
  });
}
