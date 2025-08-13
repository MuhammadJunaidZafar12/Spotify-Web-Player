// console.log("Let start Javascript")
let currentSong1 = new Audio();
let songs;
let currFolder;

// show the time duration
function formatTime(seconds) {

    seconds = Math.floor(seconds);

    if (isNaN(seconds) || seconds < 0) { 
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad with leading zeros if necessary
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// This gave us audio not using folder
// async function getSongs() {

//     let a = await fetch("http://127.0.0.1:5500/songs/");
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;

//     let songs = [];
//     let as = div.getElementsByTagName("a");
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split("/songs/")[1]);
//         }

//     }
//     return songs;
// }


// This gave us audio using folder
async function getSongs(folder) {

    let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
    currFolder = folder;
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    songs = [];
    let as = div.getElementsByTagName("a");
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="/svgs/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Singer</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="/svgs/play.svg" alt="">
                            </div></li>`;
    }

    // for play an audio when we click 
    // attach an event listner to each audio
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs
}

// play the audio function
const playMusic = (track, pause = false) => {
    // This is also play the audio but as we click the audio this will play all the audio who clicked 
    // let audio = new Audio("/songs/" + track);
    // audio.play();
    // this will play the audio correctelly
    currentSong1.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong1.play();
        play.src = "/svgs/pause.svg";

    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00 : 00";
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // here we use a json file. 
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]; 
            // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        console.log(e);
        e.addEventListener("click", async item=>{ 
            // console.log("image clicked")
            console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);  
        })
    })

}

async function main() {
    let currentSong;
    // get the list of all song
    await getSongs("songs/ncs");

    playMusic(songs[0], true);

    // display all th albums on the page 
    displayAlbum();


    // Attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong1.paused) {
            currentSong1.play();
            play.src = "/svgs/pause.svg"
        }
        else {
            currentSong1.pause();
            play.src = "/svgs/play.svg";
        } 
    })

    // listen for time update event 
    currentSong1.addEventListener("timeupdate", () => {
        // console.log(currentSong1.currentTime, currentSong1.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong1.currentTime)}/${formatTime(currentSong1.duration)}`
        document.querySelector(".circle").style.left = (currentSong1.currentTime / currentSong1.duration) * 100 + "%";
    })

    // Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong1.currentTime = ((currentSong1.duration) * percent) / 100
    })

    //Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // add an event listner to previous 
    previous.addEventListener("click", () => {
        // currentSong.pause(); 
        console.log("Previous clicked")

        let index = songs.indexOf(currentSong1.src.split("/").slice(-1)[0]);
        if ((index + 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    // add an event listner to next
    next.addEventListener("click", () => {
        console.log("Next clicked");
        // currentSong.pause();

        let index = songs.indexOf(currentSong1.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);

        }
    })

    // add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("Setting volume to ", e.target.value, "/ 100");
        currentSong1.volume = parseInt(e.target.value) / 100;
    })

    // Add event listner to mute 
    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        if (e.target.src.includes("/svgs/volume.svg")) {
            e.target.src = e.target.src.replace("/svgs/volume.svg", "/svgs/mute.svg");
            currentSong1.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace("/svgs/mute.svg", "/svgs/volume.svg",);
            currentSong1.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
}

main();