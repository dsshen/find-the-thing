/*
 * Note: the game used to be called Find Your Wallet. The wallet was originally
 * the Thing hidden in the field. Hence the naming of certain variables
 * (walletChar, walletCoord_i, etc.)
 */

/********************** FIELD CLASS **********************/

// Declare chars for wallet, hole, field and path (for console debugging)
const walletChar = '^';
const holeChar = '0';
const grassChar = '.';
const pathChar = '*';
const playerChar = 'P';

// Keep track of number of cells continuous with [0][0]
// Initialize with 1, since we're including [0][0] in the count
let numContinuous = 1;

// Store the wallet coordinates, since the wallet is destroyed by the validity test
let walletCoord_i = 0;
let walletCoord_j = 0;

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

        // randomly place wallet in the field
        // wallet cannot be on player's location or replace an existing hole
        let walleti = playeri;
        let walletj = playerj;
        while (walleti === playeri && walletj === playerj) {
            walleti = Math.floor(Math.random() * length);
            walletj = Math.floor(Math.random() * length);
            if (field[walleti][walletj] === holeChar) {
                walleti = playeri;
                walletj = playerj;
            }
        }
        field[walleti][walletj] = walletChar;

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

    // test whether current location results in win (user is on wallet)
    checkGameWin(char) {
        if (char === walletChar) {
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

    // Check whether there is a wallet at [i][j] and record its coordinates if so
    recordWalletLocation(i, j) {
        if (this.isInBounds(i, j) && this.field[i][j] === walletChar) {
            walletCoord_i = i;
            walletCoord_j = j;
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
        this.recordWalletLocation(i - 1, j);
        if (this.isInBounds(i - 1, j) &&
            this.field[i - 1][j] != holeChar &&
            this.field[i - 1][j] != pathChar &&
            this.field[i - 1][j] != playerChar) {
            numContinuous++;
            this.field[i - 1][j] = pathChar;
            this.countContinuous(i - 1, j);
        }

        // CHECK SOUTH
        this.recordWalletLocation(i + 1, j);
        if (this.isInBounds(i + 1, j) &&
            this.field[i + 1][j] != holeChar &&
            this.field[i + 1][j] != pathChar &&
            this.field[i + 1][j] != playerChar) {
            numContinuous++;
            this.field[i + 1][j] = pathChar;
            this.countContinuous(i + 1, j);
        }

        // CHECK WEST
        this.recordWalletLocation(i, j - 1);
        if (this.isInBounds(i, j - 1) &&
            this.field[i][j - 1] != holeChar &&
            this.field[i][j - 1] != pathChar &&
            this.field[i][j - 1] != playerChar) {
            numContinuous++;
            this.field[i][j - 1] = pathChar;
            this.countContinuous(i, j - 1);
        }

        // CHECK EAST
        this.recordWalletLocation(i, j + 1);
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

    // Replace wallet in its old location, because the recursive function destroys the wallet
    replaceWallet() {
        this.field[walletCoord_i][walletCoord_j] = walletChar;
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
            this.replaceWallet();
            return true;
        }
        else {
            return false;
        }
    }
}

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
// Game area's width and height are 600px in desktop mode
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

// Number of seconds to add to timer when a wallet is found
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
    runningTimer = setInterval(function() {
        timerTick();

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
            else if (field.field[i][j] === walletChar) {
                gridDiv.innerHTML += '<div class="wallet"></div>';
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
    let msg = document.getElementById('msg');
    msg.style.color = 'green';
    msg.innerHTML = 'Found it!';
    let player = document.querySelector('.player');
    player.style.backgroundColor = 'yellow';
    streakVal++;
    if (streakVal > bestStreakVal) {
        bestStreakVal = streakVal;
    }
    updateScoreboard();
    winReset(); // stillPlaying will switch back to true here
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

// Check if the player's move is the first move of the game (to start the timer etc.)
function checkIfFirstMove() {
    // update the derpy firstMove array
    let temp = firstMove[1];
    firstMove[1] = true;
    firstMove[0] = temp;

    // only call startTimer once (when the player makes the first move)
    if (firstMove[1] && !firstMove[0]) {
        updateDisplay();
        startTimer();
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

/*............... Game on! ...............*/

// Plot initial field
plotField(myField, fieldDiv);

// Listen for player movement inputs, update grid, check for game over conditions, and respond as needed
function playerMove() {
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
}
document.onkeydown = playerMove;

// Press ENTER to hard reset the game
document.addEventListener('keydown', function () {
    if (event.code === 'Enter') {
        reset();
    }
})