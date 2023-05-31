let currentTrackIndex = 0;
const songs = Array.from(document.querySelectorAll(".song"));
const player = document.getElementById("player");
const playImg = document.getElementById("play");
const pauseImg = document.getElementById("pause");

songs.forEach((song, index) => {
  song.addEventListener("click", () => {
    const previewUrl = song.getAttribute("data-preview-url");
    player.src = previewUrl;
    player.play();
    currentTrackIndex = index; // Update the current track index
    playImg.style.display = "none";
    pauseImg.style.display = "";
  });
});

document.getElementById("prev").addEventListener("click", () => {
  currentTrackIndex--;
  if (currentTrackIndex < 0) {
    currentTrackIndex = songs.length - 1; // loop back to the last song
  }
  songs[currentTrackIndex].click(); // Simulate a click on the new current song
});

document.getElementById("next").addEventListener("click", () => {
  currentTrackIndex++;
  if (currentTrackIndex >= songs.length) {
    currentTrackIndex = 0; // loop back to the first song
  }
  songs[currentTrackIndex].click(); // Simulate a click on the new current song
});

pauseImg.addEventListener("click", () => {
  player.pause();
  pauseImg.style.display = "none";
  playImg.style.display = "";
});

playImg.addEventListener("click", () => {
  player.play();
  playImg.style.display = "none";
  pauseImg.style.display = "";
});
