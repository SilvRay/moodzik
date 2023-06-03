let currentTrackIndex = 0;
const songs = Array.from(document.querySelectorAll(".song"));
const player = document.getElementById("player");
const playImg = document.getElementById("play");
const pauseImg = document.getElementById("pause");
const songNameElement = document.querySelector(".songName");
const artistNameElement = document.querySelector(".artistName");
// Select the current song and artist name elements
const currentSongNameElement = document.querySelector(".current-song-name");
const currentArtistNameElement = document.querySelector(".current-artist-name");
const progress = document.getElementById("progress");

songs.forEach((song, index) => {
  song.addEventListener("click", () => {
    // Remove the background color from all songs
    songs.forEach((song) => {
      song.style.backgroundColor = "";
    });

    // Add the background color to the currently playing song
    song.style.backgroundColor = "#8B4513";

    const previewUrl = song.getAttribute("data-preview-url");
    player.src = previewUrl;
    player.play();
    currentTrackIndex = index; // Update the current track index

    // Update the song name and artist
    const songName = song.querySelector("h3").innerText;
    const artistName = ` ${song.querySelector("p").innerText}`;
    songNameElement.innerText = songName;
    artistNameElement.innerText = artistName;
    // Also update the current song and artist name elements
    currentSongNameElement.innerText = songName;
    currentArtistNameElement.innerText = artistName;

    playImg.style.display = "none";
    pauseImg.style.display = "";

    progress.style.animation = "none"; // Reset the animation
    setTimeout(() => {
      progress.style.animation = "";
      progress.style.animationPlayState = "running"; // Restart progress bar animation
    }, 10); // Trigger reflow to make the animation restart
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
    currentTrackIndex = 0;
  }
  songs[currentTrackIndex].click();
});

pauseImg.addEventListener("click", () => {
  player.pause();
  pauseImg.style.display = "none";
  playImg.style.display = "";
  progress.style.animationPlayState = "paused"; // Stop progress bar when paused
});

playImg.addEventListener("click", () => {
  player.play();
  playImg.style.display = "none";
  pauseImg.style.display = "";
  progress.style.animationPlayState = "running"; // Continue progress bar when played
});

window.addEventListener("DOMContentLoaded", (event) => {
  const totalSongsElement = document.querySelector(".totalSongs");
  const trackList = document.querySelector(".track-list");
  const totalSongs = trackList.querySelectorAll(".song").length;
  totalSongsElement.innerText = `${totalSongs} songs - 2023`;
});
