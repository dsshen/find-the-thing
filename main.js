/********************** FIELD CLASS **********************/

// Declare chars for thing, hole, field and path (for console debugging)
const thingChar = '^';
const holeChar = '0';
const grassChar = '.';
const pathChar = '*';
const playerChar = 'P';

// Keep track of number of cells continuous with [0][0]
// Initialize with 1, since we're including [0][0] in the count
let numContinuous = 1;

// Store the thing coordinates, since the thing is destroyed by the validity test
let thingCoord_i = 0;
let thingCoord_j = 0;

class Field {
    /*............... Constructor ...............*/
    // Constructor accepts field object as argument
    // field object has field, playeri and playerj keys
    // they represent the 2d field array and the player's coordinates, respectively
    constructor(fieldObj) {
        // extract the field array and set to this.field
        this.field = fieldObj.field;

        // extract the player's starting position and set to this.i and this.j
        // this.i and this.j will be used to track the player's movement
        this.i = fieldObj.playeri;
        this.j = fieldObj.playerj;
    }

    /*............... Static Methods ...............*/
    // Randomly generate array representing square field.
    // length is integer representing the side dimensions of the field.
    // percent is integer representing the percentage of the field populated by holes.
    static generateField(length, percent) {
        // declare empty 2D field array
        const field = [];
        for (let i = 0; i < length; i++) {
            field[i] = [];
        }

        // determine number of holes to include from percent
        let numHoles = Math.round(length * length * percent / 100);

        // populate field with grass
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                field[i][j] = grassChar;
            }
        }

        // randomly place player in field
        let playeri = Math.floor(Math.random() * length);
        let playerj = Math.floor(Math.random() * length);
        field[playeri][playerj] = playerChar;

        // randomly add holes to the field
        // hole cannot be on player's location
        while (numHoles > 0) {
            let holei = Math.floor(Math.random() * length);
            let holej = Math.floor(Math.random() * length);
            let isPlayerLocation = (holei === playeri) && (holej === playerj);
            if (!isPlayerLocation && field[holei][holej] != holeChar) {
                field[holei][holej] = holeChar;
                numHoles--;
            }
        }

        // randomly place thing in the field
        // thing cannot be on player's location or replace an existing hole
        let thingi = playeri;
        let thingj = playerj;
        while (thingi === playeri && thingj === playerj) {
            thingi = Math.floor(Math.random() * length);
            thingj = Math.floor(Math.random() * length);
            if (field[thingi][thingj] === holeChar) {
                thingi = playeri;
                thingj = playerj;
            }
        }
        field[thingi][thingj] = thingChar;

        // wrap field, playeri and playerj in an object and return the object
        let fieldObj = {field, playeri, playerj};
        return fieldObj;
    }

    /*............... Instance Methods ...............*/

    // Print field array to console (for debugging)
    print() {
        for (let i = 0; i < this.field.length; i++) {
            console.log(this.field[i].join(''));
        }
    }

    // test whether current location results in win (user is on thing)
    checkGameWin(char) {
        if (char === thingChar) {
            return true;
        }
        else return false;
    }

    // test whether current location results in loss (user is on hole)
    checkGameLose(char) {
        if (char === holeChar) {
            return true;
        }
        else return false;
    }

    // Get the number of holes in the field array
    getNumHoles() {
        let numHoles = 0;
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[0].length; j++) {
                if (this.field[i][j] === holeChar) {
                    numHoles++;
                }
            }
        }
        return numHoles;
    }

    // Get the total number of cells in the field
    getTotalCells() {
        let height = this.field.length;
        let width = this.field[0].length;
        return width * height;
    }

    // Check whether an [i][j] index pair is within the field's bounds
    isInBounds(i, j) {
        if (i < 0 || i >= this.field.length ||
            j < 0 || j >= this.field[0].length) return false;
        else return true;
    }

    // Check whether there is a thing at [i][j] and record its coordinates if so
    recordThingLocation(i, j) {
        if (this.isInBounds(i, j) && this.field[i][j] === thingChar) {
            thingCoord_i = i;
            thingCoord_j = j;
        }
    }

    // update player's position based on user input.
    // input is either u, d, l or r.
    // returns identity of the square of the new position.
    updatePosition(input) {
        if (input === 'u' && this.i > 0) {
            this.field[this.i][this.j] = pathChar;
            this.i--;
            let newChar = this.field[this.i][this.j];
            this.field[this.i][this.j] = playerChar;
            return newChar;
        }
        if (input === 'd' && this.i < this.field.length - 1) {
            this.field[this.i][this.j] = pathChar;
            this.i++;
            let newChar = this.field[this.i][this.j];
            this.field[this.i][this.j] = playerChar;
            return newChar;
        }
        if (input === 'l' && this.j > 0) {
            this.field[this.i][this.j] = pathChar;
            this.j--;
            let newChar = this.field[this.i][this.j];
            this.field[this.i][this.j] = playerChar;
            return newChar;
        }
        if (input === 'r' && this.j < this.field[0].length - 1) {
            this.field[this.i][this.j] = pathChar;
            this.j++;
            let newChar = this.field[this.i][this.j];
            this.field[this.i][this.j] = playerChar;
            return newChar;
        }
    }

    /*
    We want to ensure that every generated field is valid for gameplay.
    More specifically, we want the entire play region to be continuous,
    i.e. no inaccessible grass regions.
    These methods will help us implement this test.
    */

    // Use recursion to count the number of cells continuous with [i][j]
    countContinuous(i, j) {
        // CHECK NORTH
        this.recordThingLocation(i - 1, j);
        if (this.isInBounds(i - 1, j) &&
            this.field[i - 1][j] != holeChar &&
            this.field[i - 1][j] != pathChar &&
            this.field[i - 1][j] != playerChar) {
            numContinuous++;
            this.field[i - 1][j] = pathChar;
            this.countContinuous(i - 1, j);
        }

        // CHECK SOUTH
        this.recordThingLocation(i + 1, j);
        if (this.isInBounds(i + 1, j) &&
            this.field[i + 1][j] != holeChar &&
            this.field[i + 1][j] != pathChar &&
            this.field[i + 1][j] != playerChar) {
            numContinuous++;
            this.field[i + 1][j] = pathChar;
            this.countContinuous(i + 1, j);
        }

        // CHECK WEST
        this.recordThingLocation(i, j - 1);
        if (this.isInBounds(i, j - 1) &&
            this.field[i][j - 1] != holeChar &&
            this.field[i][j - 1] != pathChar &&
            this.field[i][j - 1] != playerChar) {
            numContinuous++;
            this.field[i][j - 1] = pathChar;
            this.countContinuous(i, j - 1);
        }

        // CHECK EAST
        this.recordThingLocation(i, j + 1);
        if (this.isInBounds(i, j + 1) &&
            this.field[i][j + 1] != holeChar &&
            this.field[i][j + 1] != pathChar &&
            this.field[i][j + 1] != playerChar) {
            numContinuous++;
            this.field[i][j + 1] = pathChar;
            this.countContinuous(i, j + 1);
        }
    }

    // Reset numContinuous to 1
    resetNumContinuous() {
        numContinuous = 1;
    }

    // Reset all pathChars to grassChars
    resetPathToGrass() {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[0].length; j++) {
                if (this.field[i][j] === pathChar) {
                    this.field[i][j] = grassChar;
                }
            }
        }
    }

    // Replace thing in its old location, because the recursive function destroys the thing
    replaceThing() {
        this.field[thingCoord_i][thingCoord_j] = thingChar;
    }

    // Using the above functions, check whether or not the field is "valid".
    // A valid field has an entirely continuous play region (i.e. no inaccessible areas).
    // Returns boolean value
    isValid() {
        this.resetNumContinuous();
        this.countContinuous(this.i, this.j); // remember this.i and this.j is the player's start position initially
        let numHoles = this.getNumHoles();
        let totalCells = this.getTotalCells();
        if (numContinuous === totalCells - numHoles) {
            this.resetPathToGrass();
            this.replaceThing();
            return true;
        }
        else {
            return false;
        }
    }
}

/********************** AUDIO SETUP **********************/

// Urls of audio files
const musicUrl = './media/teamrocket_edit.wav';
const thingFoundUrl = './media/Absorb2.wav';
const levelUpUrl = './media/Absorb.wav';
const gameOverUrl = './media/Bide.wav';
const sfxUrls = [thingFoundUrl, levelUpUrl, gameOverUrl];

// Hard-code gain values for music and SFX when they are on
const musicGainOn = 0.35;
const sfxGainOn = 0.35;

// Var for storing whether or not audio is playing (i.e. game is running)
let audioIsPlaying = false;

// Var for storing whether or not game is in "danger zone"
let inDangerZone = false;

// Initialize var for storing audio buffer for music
let bufferMusic;

// Initialize array for storing audio buffers for SFX
let buffersSFX = [];

// Has the music audio buffer loaded?
let bufferMusicLoaded = false;

// Have the SFX audio buffers all loaded?
let allSFXBuffersLoaded = false;

// Vars for toggling volume on/off
let gainMusicVal = musicGainOn;
let gainSFXVal = sfxGainOn;
let toggleSound = document.getElementById('toggle-sound');
let soundOn = true;

/*..... Retrieve the music file and store in appropriate buffer .....*/

// Set up web audio pipeline with gain module
let contextMusic = new AudioContext();
let sourceMusic = contextMusic.createBufferSource();
let gainMusic = contextMusic.createGain();
gainMusic.gain.value = gainMusicVal;
sourceMusic.connect(gainMusic);
gainMusic.connect(contextMusic.destination);

// Get data using AJAX
let requestMusic = new XMLHttpRequest();
requestMusic.open('GET', musicUrl, true);
requestMusic.responseType = 'arraybuffer';
requestMusic.onload = () => {
    contextMusic.decodeAudioData(requestMusic.response, response => {
        // Store response in bufferMusic var
        bufferMusic = response;
        bufferMusicLoaded = true;
    }, () => {
        console.error('AJAX request for audio playback failed!');
    });
};

// Send request
requestMusic.send();

/*..... Retrieve the three SFX files and store in array of audio buffers .....*/

// Set up web audio pipeline with gain module
let contextSFX = new AudioContext();
let sourceSFX = contextSFX.createBufferSource();
let gainSFX = contextSFX.createGain();
gainSFX.gain.value = gainSFXVal;
sourceSFX.connect(gainSFX);
gainSFX.connect(contextSFX.destination);

// For every SFX sample, get data using AJAX
let numSFXLoaded = 0;
for (let i = 0; i < sfxUrls.length; i++) {
    let request = new XMLHttpRequest();
    request.open('GET', sfxUrls[i], true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        contextSFX.decodeAudioData(request.response, response => {
            buffersSFX[i] = response;
            numSFXLoaded++;
            if (numSFXLoaded == sfxUrls.length) {
                allSFXBuffersLoaded = true;
            }
        }, () => {
            console.error('AJAX request for audio playback failed!');
        });
    };

    // Send request
    request.send();
}

// Function for starting music playback
function startMusic() {
    if (!audioIsPlaying && bufferMusicLoaded) {
        // Repopulate the audio context
        sourceMusic = contextMusic.createBufferSource();
        gainMusic = contextMusic.createGain();
        gainMusic.gain.value = gainMusicVal;
        sourceMusic.connect(gainMusic);
        gainMusic.connect(contextMusic.destination);

        // Set up the source and play
        sourceMusic.buffer = bufferMusic;
        sourceMusic.loop = true;
        sourceMusic.loopStart = 1.7363; // magic loop start position calculated from song tempo
        sourceMusic.loopEnd = bufferMusic.duration;
        sourceMusic.start();
        audioIsPlaying = true;
    }
}

// Function for stopping music playback
function stopMusic() {
    if (audioIsPlaying) {
        sourceMusic.stop();
        sourceMusic.buffer = null;
        audioIsPlaying = false;
    }
}

// Function for triggering "danger-mode" playback (+2 semitones)
function dangerMusic() {
    if (audioIsPlaying) {
        sourceMusic.playbackRate.value = 1.1225; // transpose 2 semitones
    }
}

// Function for deactivating danger mode
function safetyMusic() {
    if (audioIsPlaying) {
        sourceMusic.playbackRate.value = 1.0;
    }
}

// Function for playing an SFX sound
function playSFX(sfxName) {
    if (allSFXBuffersLoaded) {
        sourceSFX = contextSFX.createBufferSource();
        gainSFX = contextSFX.createGain();
        gainSFX.gain.value = gainSFXVal;
        sourceSFX.connect(gainSFX);
        gainSFX.connect(contextSFX.destination);
        if (sfxName == 'thingFound') {
            sourceSFX.buffer = buffersSFX[0];
        }
        else if (sfxName == 'levelUp') {
            sourceSFX.buffer = buffersSFX[1];

        }
        else if (sfxName == 'gameOver') {
            sourceSFX.buffer = buffersSFX[2];
        }
        sourceSFX.start();
    }
}

// Toggle sound on/off
toggleSound.addEventListener('click', event => {
    event.preventDefault();

    // Set gain values
    if (soundOn) {
        soundOn = false;
        toggleSound.style.color = 'gray';
        toggleSound.style.backgroundColor = 'rgb(230, 230, 230)';
        gainMusicVal = 0.0;
        gainSFXVal = 0.0;
    }
    else {
        soundOn = true;
        toggleSound.style.color = 'black';
        toggleSound.style.backgroundColor = 'rgb(190, 190, 190)';
        gainMusicVal = musicGainOn;
        gainSFXVal = sfxGainOn;
    }

    // If audio is playing, update gain nodes
    if (audioIsPlaying) {
        gainMusic.gain.value = gainMusicVal;
        gainSFX.gain.value = gainSFXVal;
    }
})



/********************** MAIN SECTION **********************/

/*............... Initial Setup ...............*/

// INITIAL VALUES
const initialFieldSideLength = 5;
const initialHolePercent = 40;
const initialNumSecsToAdd = 5;

// Generate field
let holePercent = initialHolePercent;
let fieldSideLength = initialFieldSideLength;
let myField = new Field(Field.generateField(fieldSideLength, holePercent));

// Ensure that the generated field is valid (keep generating fields until this is so)
while (!myField.isValid()) {
    myField = new Field(Field.generateField(fieldSideLength, holePercent));
}

// Prepare initial field for display with CSS grid
// Game area's width and height are 420px in desktop mode
let fieldDiv = document.querySelector('.field-grid');
let fieldWidth = 420;
let fieldHeight = 420;
fieldDiv.style.width = `${fieldWidth}px`;
fieldDiv.style.height = `${fieldHeight}px`;

// Function for setting grid-template-rows and grid-template-columns (will be reused)
function setGridTemplate() {
    let fieldRowLength = fieldHeight / myField.field.length;
    let fieldColLength = fieldWidth / myField.field[0].length;
    let gridRowString = '';
    let gridColString = '';
    for (let i = 0; i < myField.field.length; i++) {
        gridRowString += `${fieldRowLength}px `;
    }
    for (let j = 0; j < myField.field[0].length; j++) {
        gridColString += `${fieldColLength}px `;
    }
    fieldDiv.style.gridTemplateRows = gridRowString;
    fieldDiv.style.gridTemplateColumns = gridColString;
}
setGridTemplate();

// Are you still playing?
let stillPlaying = true;

// Derpy array that will help with starting the timer upon the player's first move
const firstMove = [false, false];

// Initialize scoreboard and level
let streakVal = 0;
let bestStreakVal = 0;
let level = 1;

// Number of seconds to add to timer when a thing is found
let numSecsToAdd = initialNumSecsToAdd;

/*............... Timer Setup ...............*/

// Retrieve HTML element for timer display
let timerDisplay = document.getElementById('timer');

// Store minutes, seconds and centiseconds in variables
// Default is 00:10:00
let minutes = 0;
let seconds = 10;
let centiseconds = 0;

// Store string variables for displaying minutes, seconds and centiseconds
let displayMinutes = '';
let displaySeconds = '';
let displayCentiseconds = '';

let runningTimer; // this will store setInterval()

// Check if timer is at 00:00:00
function timerAtZero() {
    if (minutes === 0 && seconds === 0 && centiseconds === 0) {
        return true;
    }
}

// Check if timer is below 05:00:00
function timerInDanger() {
    if (minutes === 0 && seconds <= 4) {
        return true;
    }
}

// Add time to the display. amt is the number of seconds to add
function addTime(amt) {
    if (seconds + amt >= 60) {
        seconds += amt - 60;
        minutes++;
    }
    else {
        seconds += amt;
    }
}

// append leading zeros if needed for displaying minutes, secs and centisecs
function updateDisplay() {
    if (centiseconds < 10) displayCentiseconds = '0' + centiseconds;
    else displayCentiseconds = '' + centiseconds;
    if (seconds < 10) displaySeconds = '0' + seconds;
    else displaySeconds = '' + seconds;
    if (minutes < 10) displayMinutes = '0' + minutes;
    else displayMinutes = '' + minutes;
    timerDisplay.innerHTML = displayMinutes + ':' + displaySeconds + ':' + displayCentiseconds;
}

// Function for ticking the timer down every centisecond (assuming timer hasn't run out)
function timerTick() {
    // countdown logic
    if (centiseconds === 0) {
        centiseconds = 99;
        if (seconds === 0) {
            seconds = 59;
            minutes--;
        }
        else {
            seconds--;
        }
    }
    else {
        centiseconds--;
    }

    // update display
    updateDisplay();
}

// Start the timer
function startTimer() {
    // Start the timer countdown
    runningTimer = setInterval(function() {
        timerTick();

        // if timer is in danger zone (below 05:00:00) and danger music not already
        // triggered, trigger danger music
        if (timerInDanger() && !inDangerZone) {
            inDangerZone = true;
            dangerMusic();
        }

        // conversely, if timer not in danger zone and music has not yet been reset,
        // reset music to normal
        else if (!timerInDanger() && inDangerZone) {
            inDangerZone = false;
            safetyMusic();
        }

        // if timer runs to zero, game over
        if (timerAtZero()) {
            clearInterval(runningTimer);
            stillPlaying = false;
            gameLose();
        }
    }, 10);
}

/*............... Other Helper Functions ...............*/

// Plot field array within the DOM
// field is a Field object, gridDiv is the containg div element for your grid items
function plotField(field, gridDiv) {
    setGridTemplate(); // ensure rows and columns line up properly
    gridDiv.innerHTML = '';
    for (let i = 0; i < field.field.length; i++) {
        for (let j = 0; j < field.field[0].length; j++) {
            if (field.field[i][j] === grassChar) {
                gridDiv.innerHTML += '<div class="grass"></div>';
            }
            else if (field.field[i][j] === holeChar) {
                gridDiv.innerHTML += '<div class="hole"></div>';
            }
            else if (field.field[i][j] === pathChar) {
                gridDiv.innerHTML += '<div class="path"></div>';
            }
            else if (field.field[i][j] === playerChar) {
                gridDiv.innerHTML += '<div class="player"></div>';
            }
            // this will not appear in the final product
            else if (field.field[i][j] === thingChar) {
                gridDiv.innerHTML += '<div class="thing"></div>';
            }
        }
    }
}

// Update scoreboard
function updateScoreboard() {
    let streak = document.getElementById('streak');
    let bestStreak = document.getElementById('best-streak');
    streak.innerHTML = streakVal;
    bestStreak.innerHTML = bestStreakVal;
}

// You won!
function gameWin() {
    stillPlaying = false // is only temporary!
    let player = document.querySelector('.player');
    player.style.backgroundColor = 'yellow';
    streakVal++;
    if (streakVal > bestStreakVal) {
        bestStreakVal = streakVal;
    }
    updateScoreboard();
    winReset(); // stillPlaying will switch back to true here

    // Play appropriate SFX and update msg
    // If level remains same, play thingFoundUrl and display "Found it!"
    // If leveled up, play levelUpUrl and display "Level up!"
    let msg = document.getElementById('msg');
    msg.style.color = 'green';
    if (streakVal % 3 === 0) {
        playSFX('levelUp');
        msg.innerHTML = 'Level up!';
    }
    else {
        playSFX('thingFound');
        msg.innerHTML = 'Found it!';
    }
}

// You lost, you dumb fuck!
function gameLose() {
    stillPlaying = false;
    let msg = document.getElementById('msg');
    msg.style.color = 'red';
    msg.innerHTML = 'You lose!';
    let player = document.querySelector('.player');
    player.style.backgroundColor = 'red';
    clearInterval(runningTimer);

    // Play game over SFX
    playSFX('gameOver');
    
    // Stop music when game ends
    stopMusic();
}

// Check field for game-over conditions. char is the character returned from updatePosition() method
function checkGameOver(field, char) {
    if (field.checkGameWin(char)) {
        gameWin();
    }
    if (field.checkGameLose(char)) {
        gameLose();
    }
}

// Check if the player's move is the first move of the game (to start the timer, audio, etc.)
function checkIfFirstMove() {
    // update the derpy firstMove array
    let temp = firstMove[1];
    firstMove[1] = true;
    firstMove[0] = temp;

    // only call startTimer and startMusic once (when the player makes the first move)
    if (firstMove[1] && !firstMove[0]) {
        updateDisplay();
        startTimer();
        startMusic();
    }
}

// update the game's level
// when the game levels up, the field's side dimension increases by 1
// game levels up after every 3 wins
function updateLevel() {
    level = Math.floor(streakVal / 3) + 1;
    document.getElementById('level').innerHTML = level;
    fieldSideLength = initialFieldSideLength + level - 1;
}

// Soft reset the game after a win, pausing the timer briefly and adding time to it
// Also calls updateLevel()
let timeoutFunc;
function winReset() {
    // Pause timer and add time to it
    clearInterval(runningTimer);
    addTime(numSecsToAdd);
    timeoutFunc = setTimeout(function () {
        // Reset message
        let msg = document.getElementById('msg');
        msg.innerHTML = '';

        // Reset player color
        let player = document.querySelector('.player');
        player.style.backgroundColor = 'cyan'

        // Update level and regenerate field
        updateLevel();
        myField = new Field(Field.generateField(fieldSideLength, holePercent));
        while (!myField.isValid()) {
            myField = new Field(Field.generateField(fieldSideLength, holePercent));
        }
        plotField(myField, fieldDiv);

        // Start play
        startTimer();
        stillPlaying = true;
    }, 1000);
}

// Hard reset the game
function reset() {
    // Stop timer and reset time to 00:10:00
    clearTimeout(timeoutFunc);
    clearInterval(runningTimer);
    minutes = 0;
    seconds = 10;
    centiseconds = 0;

    // Reset messages and player color
    timerDisplay.innerHTML = 'READY??'
    let msg = document.getElementById('msg');
    msg.innerHTML = '';
    let player = document.querySelector('.player');
    player.style.backgroundColor = 'cyan'

    // Reset all field parameters to initial vals and generate new field
    holePercent = initialHolePercent;
    fieldSideLength = initialFieldSideLength;
    myField = new Field(Field.generateField(fieldSideLength, holePercent));
    while (!myField.isValid()) {
        myField = new Field(Field.generateField(fieldSideLength, holePercent));
    }
    plotField(myField, fieldDiv);

    // Reset boolean switches
    stillPlaying = true;
    firstMove[0] = false;
    firstMove[1] = false;

    // Reset scores and level
    streakVal = 0;
    updateLevel();
    updateScoreboard();
}

/*............... Game on ...............*/

// Plot initial field
plotField(myField, fieldDiv);

// Listen for player movement inputs, update grid, check for game over conditions, and respond as needed
document.addEventListener('keydown', event => {
    // listen for the right inputs
    if ((event.code === 'KeyW' || event.code === 'ArrowUp') && stillPlaying) {
        let newChar = myField.updatePosition('u');
        if (newChar) checkIfFirstMove();
        plotField(myField, fieldDiv);
        checkGameOver(myField, newChar);
    }
    if ((event.code === 'KeyA' || event.code === 'ArrowLeft') && stillPlaying) {
        let newChar = myField.updatePosition('l');
        if (newChar) checkIfFirstMove();
        plotField(myField, fieldDiv);
        checkGameOver(myField, newChar);
    }
    if ((event.code === 'KeyS' || event.code === 'ArrowDown') && stillPlaying) {
        let newChar = myField.updatePosition('d');
        if (newChar) checkIfFirstMove();
        plotField(myField, fieldDiv);
        checkGameOver(myField, newChar);
    }
    if ((event.code === 'KeyD' || event.code === 'ArrowRight') && stillPlaying) {
        let newChar = myField.updatePosition('r');
        if (newChar) checkIfFirstMove();
        plotField(myField, fieldDiv);
        checkGameOver(myField, newChar);
    }
});

// Press ENTER to hard reset the game
document.addEventListener('keydown', event => {
    if (event.code === 'Enter') {
        reset();
        stopMusic();
    }
})