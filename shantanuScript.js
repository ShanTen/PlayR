/*Format:
  {
    title: 'Entertain Me', //notice no '.mp3' at the end
    artist: 'Ylona Garcia'|| undefined,
    picture:   <BufferObject>] || undefined,
    filePath: 'Without Me F1 Remix (feat. Alfonso, Raghunathan & Rob Kubica) [VmyqGe_VNWw].mp3'
  }
*/

let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let playlistDisplay = document.querySelector('.playlist-display');

let track_index = 0;
let isPlaying = false;
let updateTimer;

var GLOBAL = {};
GLOBAL.track_list = [];
track_list = GLOBAL.track_list;


// Create new audio element
let curr_track = document.createElement('audio');

function setPlaylist(){
  console.log(`Track list is ${GLOBAL.track_list}`)
  GLOBAL.track_list.forEach(track => {
  // Create track element
  var trackElement = document.createElement('div');
  trackElement.classList.add('pl-track'); 
  
  // Create track image
  var trackImage = document.createElement('img');
  trackImage.classList.add('pl-track-image');

  let imgBufferData;
  imgBufferData = track.picture;
  if(imgBufferData!=null){
    imgBufferData = track.picture[0].data.data;  //dont just dont.
    let unit8buf = Uint8Array.from(imgBufferData)    
    var pain = URL.createObjectURL(new Blob([unit8buf], { type: 'image/jpeg' }));
    trackImage.src = pain;
  }
  else{
    trackImage.src = 'https://www.scottishculture.org/themes/scottishculture/images/music_placeholder.png'; 
  }
  
  // // Create track info
  var trackInfo = document.createElement('div');
  trackInfo.classList.add('pl-track-info');
  
  // Create track name
  var trackName = document.createElement('div');
  trackName.classList.add('pl-track-name');
  trackName.textContent = track.title;
  
  // Create track artist
  var trackArtist = document.createElement('div');
  trackArtist.classList.add('pl-track-artist');
  trackArtist.textContent = track.artist;
  
  // Append track info to track element
  trackInfo.appendChild(trackName);
  trackInfo.appendChild(trackArtist);
  
  // Append track image and track info to track element
  trackElement.appendChild(trackImage);
  trackElement.appendChild(trackInfo);
  
  // Append track element to playlist display
  playlistDisplay.appendChild(trackElement);
  });
}

function random_bg_color() {

  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  document.body.style.background = bgColor;
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  track_list = GLOBAL.track_list;

  curr_track.src = `http://localhost:5050/api/getSong/${track_list[track_index].filePath}`; 
  curr_track.load();

  let imgBufferData;
  imgBufferData = track_list[track_index].picture;
  
  if(imgBufferData!=null){
    //var dogImg = "https://www.shutterstock.com/image-photo/three-dogs-hugging-border-collie-260nw-501517132.jpg"

    imgBufferData = track_list[track_index].picture[0].data.data;  //dont just dont.
    let unit8buf = Uint8Array.from(imgBufferData)    
    var pain = URL.createObjectURL(new Blob([unit8buf], { type: 'image/jpeg' }));

    track_art.style.backgroundImage = `url("${pain}")`;
  }
  else{
    track_art.style.backgroundImage = "url('https://www.scottishculture.org/themes/scottishculture/images/music_placeholder.png')"; 
  }

  track_name.textContent = track_list[track_index].title;
  
  if (track_list[track_index].title.length > 20){
    track_name.textContent = track_list[track_index].title.slice(0,20)+'...';
  }

  let hidden = document.querySelector('.hidden-fullname');
  hidden.textContent = track_list[track_index].title;

  track_artist.textContent = track_list[track_index].artist;

  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';;
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

function LoadTracks(){
  axios.get('http://localhost:5050/api/getMetaData').then( res => {
    GLOBAL.track_list = res.data
    //setPlaylist()
    loadTrack(track_index);
  }).catch( err => {console.log(err);});
}

LoadTracks();