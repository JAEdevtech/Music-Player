const tracks = document.getElementById("tracks");
const audioList = document.getElementById("audioList");
const section = document.getElementById("playbackQueue");
const canvas = document.getElementById("audioVisualiser");
const body = document.body;
const next = document.getElementById("nextt");
const prev = document.getElementById("previous");
const nowPlaying = document.createElement("pre");
const source = document.createElement("source")

const audioElement = new Audio();
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
const srcNode = audioCtx.createMediaElementSource(audioElement);

section.prepend(audioElement);
audioElement.type = "audio/ogg"
audioElement.controls = true;
audioElement.autoplay = true;

srcNode.connect(analyser);
srcNode.connect(audioCtx.destination);

let blobInt = 0;
let songInt = 0;

const blobArray = [];
const fileArray = [];

section.prepend(nowPlaying);

const binCount = analyser.frequencyBinCount;
const arraybuffer = new Uint8Array(binCount);

const cCtx = canvas.getContext("2d");
let x = 0;

function visualiser() {
  x = 0;
  cCtx.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(arraybuffer);
  for (let i = 0; i < binCount; i++) {
    let byteData = arraybuffer[i];
    cCtx.fillStyle = "yellow";
    cCtx.fillRect(
      x,
      canvas.height - byteData,
      canvas.width / binCount,
      canvas.height
    );
    x = x + canvas.width / binCount;
  }
  requestAnimationFrame(visualiser);
}
visualiser();

function loopThroughFileObjects(files) {
  for (const track of files) {
    localStorage.setItem(`Song title:${songInt++}`, track.name);
    blobArray.push(URL.createObjectURL(track));
    fileArray.push(track);
  }
}

tracks.addEventListener("change", () => {
  next.disabled = false;
  prev.disabled = false;
  const queue = document.getElementById("queue"); /* PlayBack Queue */
  const files = tracks.files;
  loopThroughFileObjects(files);

  queue.addEventListener("click", selectedAudioElementHandler);

  // move blob array to Local storage
  blobArray.map((blob) => {
    localStorage.setItem(`track:${blobInt++}`, blob);
  });

  // set data for each item(track) in file array
  fileArray.forEach((file, index) => {
    const li = document.createElement("li");
    queue.appendChild(li).innerHTML = file.name;
    li.id = "no.";
    li.value = index;
    li.dataset.dataHref = localStorage.getItem(`track:${index}`);
    li.dataset.title = localStorage.getItem(`Song title:${index}`);
  });
});

function selectedAudioElementHandler(selected_li) {
  audioElement.src = selected_li.target.dataset.dataHref;
  nowPlaying.textContent = selected_li.target.dataset.title;

  audioElement.addEventListener("play", () => {
    audioElement.dataset.playing = true;
    audioElement.dataset.index = selected_li.target.value;

    audioElement.addEventListener("pause", (E) => {
      audioElement.dataset.playing = false;
      if (E.target.currentTime === E.target.duration) {
        for (const track of queue.children) {
          if (audioElement.src === track.dataset.dataHref) {
            control(track.nextSibling);
            return;
          }
        }
      }
    });
  });
}

function control(action) {
  audioElement.src = action.dataset.dataHref;
  nowPlaying.innerHTML = action.dataset.title;
  audioElement.dataset.index = action.dataset.index;
}

function next_prevHandler(ev) {
  console.log(ev);
  for (const track of queue.children) {
    if (audioElement.src === track.dataset.dataHref) {
      if (
        ev.target.attributes.id.value === "nextt" ||
        ev.target.attributes.id.value === "n"
      ) {
        control(track.nextSibling);
      } else if (
        ev.target.attributes.id.value === "previous" ||
        ev.target.attributes.id.value === "p"
      ) {
        control(track.previousSibling);
      }
      return;
    }
  }
}

next.addEventListener("click", (ev) => next_prevHandler(ev));

prev.addEventListener("click", (ev) => next_prevHandler(ev));


