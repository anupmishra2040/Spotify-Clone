 console.log('lets write javascript');

let currentSong = new Audio();  // Initialize Audio object
let playButton = document.querySelector('#play');  // Play button
let songTime = document.querySelector('.songtime');  // Display current song time
let circle = document.querySelector('.circle');  // Circle for seek bar
let seekbar = document.querySelector('.seekbar');  // Seekbar
let volumeSlider = document.querySelector('.range input');  // Volume control
let nextButton = document.querySelector('#next');  // Next button
let previousButton = document.querySelector('#previous');  // Previous button
let currFolder;
let currentSongIndex = 0;  // Initialize current song index
let songs = [];  // To store the fetched songs

// Convert seconds to MM:SS format
function formatTime(seconds) {
    if (isNaN(seconds)) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fetch songs from the server
// Fetch songs from the server
async function getSongs(folder) {
    let response = await fetch(`http://127.0.0.1:5500/${folder}`);  // Replace with your actual server URL
    let html = await response.text();  // Get the response as plain text
    currFolder = folder;
    let div = document.createElement("div");
    div.innerHTML = html;

    let as = div.getElementsByTagName("a");  // Assuming the server lists files as <a> elements
    let songList = [];  // Corrected to store the fetched songs

    // Loop through the <a> tags and find .mp3 files
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let originalSongName = element.href.split(`/${folder}`)[1];

            // Clean up song name
            let cleanedSongName = originalSongName
                .replace("(PagalWorld.com.sb)", "")
                .replace(".mp3", "")
                .replaceAll("%20", " ")
                .replace(/^\//, "");  // Remove leading slash if present

            songList.push({ original: originalSongName, display: cleanedSongName });
        }
    }

    return songList;
}



/// Function to play the selected song
const playMusic = (track) => {
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();
    playButton.src = "img/pause.svg";  // Change play button to pause icon

    // Clean the track name for display
    let cleanedTrackName = track
        .replace("/","") // Remove leading slash if present
        .replace("(PagalWorld.com.sb)", "") // Remove unwanted part
        .replace(".mp3", "") // Remove .mp3 extension
        .replaceAll("%20", " "); // Replace URL encoded spaces with actual spaces

    document.querySelector(".songinfo").innerHTML = cleanedTrackName;  // Display cleaned song name
};


// Function to display the albums
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    cardContainer.innerHTML = ''; // Clear previous cards
    Array.from(anchors).forEach(async (e) => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];

            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="" />
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    });
}

// Main function to get songs and display them
async function main() {
    songs = await getSongs("songs/ncs");  // Store fetched songs in the global array
    displayAlbums();
    updateSongList();  // Function to update song list on initial load
}

// Function to update the song list
function updateSongList() {
    let songUL = document.querySelector(".songList ul");  // Grab the <ul> element for song list
    songUL.innerHTML = '';  // Clear previous songs if any

    // Add songs to the song list
    for (const song of songs) {
        songUL.innerHTML += `<li data-url="${song.original}">
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.display}</div>
                <div>Mishra</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Add click event listeners to each song
    document.querySelectorAll(".songList li").forEach((e, index) => {
        e.addEventListener("click", () => {
            currentSongIndex = index;  // Update the current song index
            let fullURL = e.getAttribute('data-url');
            playMusic(fullURL);

        });
    });
}

// Folder navigation for cards
document.addEventListener("click", (event) => {
    const target = event.target.closest(".card");
    if (target) {
        const folder = target.dataset.folder;
        getSongs(`songs/${folder}`).then((fetchedSongs) => {
            songs = fetchedSongs;  // Update global songs array

            updateSongList();  // Refresh the song list with new songs
            
            // Play the first song in the folder if available
            if (songs.length > 0) {
                currentSongIndex = 0;  // Set the current song index to the first song
                playMusic(songs[currentSongIndex].original);  // Play the first song
            }
        });
    }
});

// Play/Pause functionality
playButton.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        playButton.src = "img/pause.svg";
    } else {
        currentSong.pause();
        playButton.src = "img/play.svg";
    }
});

// Update song time and seek bar
currentSong.addEventListener("timeupdate", () => {
    songTime.innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

// Seek bar functionality
seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / seekbar.offsetWidth);
    circle.style.left = percent * 100 + "%";
    currentSong.currentTime = percent * currentSong.duration;
});

// Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});

// Add event listener to volume slider
document.querySelector(".range input").addEventListener("change", (e) => {
    let volumeValue = parseInt(e.target.value) / 100;  // Parse and convert to fraction
    currentSong.volume = volumeValue;  // Set the audio volume

    console.log("Setting volume to", e.target.value, "/ 100");

    // Update the volume icon based on the slider value
    let volumeIcon = document.querySelector(".volume>img");
    if (volumeValue > 0) {
        volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
    } else {
        volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
    }
});

// Add event listener to mute/unmute button
document.querySelector(".volume>img").addEventListener("click", (e) => {
    let volumeIcon = e.target;

    if (volumeIcon.src.includes("volume.svg")) {
        // Mute the song and update the icon
        volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;  // Set slider to 0
    } else {
        // Unmute and set volume to 10%
        volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
        currentSong.volume = 0.10;  // Set to 10% volume
        document.querySelector(".range input").value = 10;  // Update slider value
    }
});



// Previous song functionality
previousButton.addEventListener("click", () => {
    if (currentSongIndex > 0) {
        currentSongIndex--;  // Move to the previous song
        playMusic(songs[currentSongIndex].original);
    }
});

// Next song functionality
nextButton.addEventListener("click", () => {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;  // Move to the next song
        playMusic(songs[currentSongIndex].original);
    }
});

// Initialize the app
main();
