const context = new (window.AudioContext || window.webkitAudioContext)();
const audio = document.getElementById("audio");
audio.autoplay = true;
audio.controls = true;

audio.setAttribute("crossOrigin", "anonymous");

const source = context.createMediaElementSource(audio);

const analyser = context.createAnalyser();
source.connect(analyser);

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

// Get a canvas defined with ID "oscilloscope"
const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

// draw an oscilloscope of the current audio source

function draw() {
  requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = "rgb(200, 200, 200)";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";

  canvasCtx.beginPath();

  const sliceWidth = canvas.width * 1.0 / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

draw();

source.connect(context.destination);

document.getElementById("input").addEventListener("change", e => {
  const url = URL.createObjectURL(e.target.files[0]);
  audio.src = url;
});

document.getElementById("podcast").addEventListener("click", () => {
  const url =
    "http://cf-media.sndcdn.com/XjYswaAshTWP?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vWGpZc3dhQXNoVFdQIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNTA2MDA3OTkxfX19XX0_&Signature=rGScfcjqJp3ZFMeeiovou39xp8q78CHEyEYgHtjXQ3rKDhzQza9Bv9JFDexhdWlLD2xw7JQ8OHhRPaG5CKwQy1bojrwBSdwFaXZD2LIRmuQE5gRToNs6Glop89cBpDBbTKRWLFLZ37dH9kB438C-6TKB1yygzLVTSsx6p9Dt1mWldVaKDKxApDYYUuPvVq9ZCLScAoa2-4jOmPzmPjcoyrX~3BdLCRhXYYlxNTFBEKXmWhnBq10ZD01ERz-32WGcM1IydxIIoCsthgNBgDHoig26~YM7vskXswf8khi9i02cuAZcCPLIgKBdbFcHiRRErwd4Qq1hv210gH~hcIXTEg__&Key-Pair-Id=APKAJAGZ7VMH2PFPW6UQ";
  audio.src = url;
});
