console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="./img/music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                    <div>Artist</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="./img/play.svg" alt="">
                                </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "./img/pause.svg";
    }
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]; // Get the folder name
            // Correct URL path for fetching info.json
            let infoUrl = `./songs/${folder}/info.json`;

            try {
                // Fetch the metadata of the folder (info.json)
                let response = await fetch(infoUrl);
                if (!response.ok) throw new Error(`File not found: ${infoUrl}`);
                let jsonResponse = await response.json();

                // Dynamically add album cards with metadata
                cardContainer.innerHTML += ` 
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="./songs/${folder}/cover.jpg" alt="">
                        <h2>${jsonResponse.title}</h2>
                        <p>${jsonResponse.description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error fetching info.json:", error.message);
            }
        }
    }

    // Attach click event listeners to the album cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0], true); // Don't autoplay
        });
    });
}

async function main() {
    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to play
    const playButton = document.getElementById("play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "./img/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "./img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });

    // Add an event to volume
    document.querySelector(".range").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to mute the track
    document.querySelector(".volume").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "./img/mute.svg";
            currentSong.volume = 0;
        } else {
            e.target.src = "./img/volume.svg";
            currentSong.volume = 0.1;
        }
    });
}

main();
