/**
 * The Tile Slider Game
 * Javascript code
 * @author Erick Levy <erickevyATgmailDOTcom>
 * @requires config.js The file with the structure for configuration's options (loaded in index.html)
 */

// Gameboard setup
let giHeight = sessionStorage.getItem('gameboardHeight') || 400;
let giWidth = sessionStorage.getItem('gameboardWidth') || 400;
let giRows = sessionStorage.getItem('rows') || 4;
let giCols = sessionStorage.getItem('cols') || 4;
let giSpan = sessionStorage.getItem('span') || 1;

// Some Constants
const levelFactor = 2; // 1: Easy, 2: Normal, 3: Hard
const levelMovs = levelFactor * giRows * giCols;

// Some paths
const imagePath = './img/';
const soundPath = './raw/';
const langPath = './lang/'

// Some default settings
var gbPlaySounds = (localStorage.getItem('playSounds') === 'true');
var gsTileStyle = localStorage.getItem('tileStyle') || "tile";
var gsTileScheme = localStorage.getItem('tileScheme') || "brown";

// Image for tiles
var gsTileImage = imagePath + config.styles[gsTileStyle].schemes[gsTileScheme].tileImage || imagePath + 'tile-light.png';
var gsTileImageAlt = imagePath + config.styles[gsTileStyle].schemes[gsTileScheme].tileImageAlt || imagePath + 'tile-dark.png';

// Default sounds
var soundSlide = soundPath + config.styles[gsTileStyle].soundSlide || 'tile-slide.mp3';
var soundError = soundPath + config.styles[gsTileStyle].soundError || 'tile-error.mp3';

// Other sounds
var soundStart = soundPath + 'start_sound.mp3';
var soundWinner = soundPath + 'winner_sound.mp3';
var soundGameOver = soundPath + 'game_over_sound.mp3';

// Collecions
var allTiles = new Array();

// Game control global variables
var giSteps = 0;
var gbGameOver = true;

// Game statistics
var stats = JSON.parse(localStorage.getItem('tilesliderStats')) || {
    gamesPlayed: 0,
    gamesEnded: 0,
    gamesWon: 0,
    performance: [0, 0, 0, 0, 0, 0, 0, 0, 0]
}

// DOM elements mapping
const appLongName = document.getElementById('appLongName');
const lblText = document.getElementById('lblText');
const btnStart = document.getElementById('btnStart');
const btnHelp = document.getElementById('btnHelp');
const btnAbout = document.getElementById('btnAbout');
const btnStats = document.getElementById('btnStats');
const btnConfig = document.getElementById('btnConfig');

const gameboardContainer = document.getElementById('gameboard-container');

// Initialization of the DOM interface
function run() {

    // Prepare event listeners
    btnStart.addEventListener('click', btnStartOnClick);
    btnHelp.addEventListener('click', btnHelpOnClick);
    btnAbout.addEventListener('click', btnAboutOnClick);
    btnStats.addEventListener('click', btnStatsOnClick);
    btnConfig.addEventListener('click', btnConfigOnClick);

    gameInitialize();
}

// Game initialization
function gameInitialize() {

    // Gameboard setup
    gameboardContainer.style.width = giWidth + 'px';
    gameboardContainer.style.height = giHeight + 'px';
    gameboardContainer.innerHTML = '';
    let rows = giRows;
    let cols = giCols;
    let span = giSpan;
    // Images for tiles
    gsTileImage = imagePath + config.styles[gsTileStyle].schemes[gsTileScheme].tileImage;
    gsTileImageAlt = imagePath + config.styles[gsTileStyle].schemes[gsTileScheme].tileImageAlt;
    // Initialize the tile matrix
    allTiles = new Array(rows);
    // Calculate tile size
    let tileWidth = Math.floor((gameboardContainer.offsetWidth - (span * (cols - 1))) / cols);
    let tileHeight = Math.floor((gameboardContainer.offsetHeight - (span * (rows - 1))) / rows);
    // Adjust the number of columns per row in the style grid template
    gameboardContainer.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)'
    // Create all tiles one by one (by row and column)
    for (var r = 0; r < rows; r++) {
        allTiles[r] = new Array(cols);
        for (var c = 0; c < cols; c++) {
            // Create a button as the tile element
            var tile = document.createElement('button');
            let i = rows * r + c + 1;
            tile.value = i;
            tile.style.width = tileWidth + 'px';
            tile.style.height = tileHeight + 'px';
            tile.style.top = (r * (tileHeight + span)) + 'px';
            tile.style.left = (c * (tileWidth + span)) + 'px';
            tile.dataset.row = r;
            tile.dataset.col = c;
            // Id's for the tiles and last tile Id
            if (i < rows * cols) {
                tile.id = 'tile-' + i;
            } else {
                tile.id = 'tile-last';
            }
            // Assign the tile style class
            tile.classList.add('tile');
            // Tile style
            if (gsTileStyle == 'tile') {
                // Alternate tile patterns
                //  + Checkers: (r + c + 1) % 2 == 0
                //  + Horizontal: (r + 1) % 2 == 0
                //  + Vertical: (c + 1) % 2 == 0
                if ((r + c + 1) % 2 == 0) {
                    tile.style.backgroundImage = 'url(' + gsTileImageAlt + ')';
                } else {
                    tile.style.backgroundImage = 'url(' + gsTileImage + ')';
                }
                // Number font family and color
                tile.innerText = i;
                tile.style.fontFamily = config.styles[gsTileStyle].schemes[gsTileScheme].fontFamily || 'Times New Roman';
                tile.style.color = config.styles[gsTileStyle].schemes[gsTileScheme].color || '#963';
                tile.style.fontSize = Math.floor(0.5 * Math.min(tileHeight, tileWidth)) + 'px';
            } else if (gsTileStyle == 'image') {
                // Assign the background image, size, and position in each tile
                tile.classList.add('image');
                tile.style.backgroundImage = 'url(' + gsTileImage + ')';
                tile.style.backgroundSize = (rows > cols ? rows : cols) * 100 + "%"; // ToDo: Check how works
                tile.style.backgroundPosition = "top ?px left ?px"
                    .replace('?', -tileHeight * r)
                    .replace('?', -tileWidth * c);
            }
            // Assign the tile click handler
            tile.addEventListener('click', tileButtonOnClick);
            // Append the button to the UI and to the control collection
            gameboardContainer.appendChild(tile);
            allTiles[r][c] = tile;
        }
    }
}

function tileButtonOnClick(e) {
    if (!gbGameOver) {
        slideTiles(e.target);
        updateSteps();
    }
}

function btnHelpOnClick() {
    msgbox(strings.helpTitle, strings.helpMessage.join(' '));
}

function btnAboutOnClick() {
    msgbox(strings.aboutTitle, strings.aboutMessage.join(' '));
}

function btnStatsOnClick() {
    statsboxOpen();
}

function btnConfigOnClick() {
    if (!gbGameOver) {
        msgbox(strings.restartTitle,
            strings.restartMessage,
            [strings.btnOk, strings.btnCancel],
            msgboxConfigConfirmation);
    } else {
        configboxOpen();
    }
}

function msgboxConfigConfirmation(e) {
    msgboxClose();
    let btnPressed = e.target.innerText;
    if (btnPressed === strings.btnOk) {
        configboxOpen();
    }
}

function btnStartOnClick() {
    if (!gbGameOver) {
        msgbox(strings.restartTitle,
            strings.restartMessage,
            [strings.btnOk, strings.btnCancel],
            msgboxRestartConfirmation);
    } else {
        restartGame();
    }
}

function msgboxRestartConfirmation(e) {
    msgboxClose();
    let btnPressed = e.target.innerText;
    if (btnPressed === strings.btnOk) {
        restartGame();
    }
}

function restartGame() {
    document.getElementById('tile-last').classList.add('hide');
    // Scramble tiles until some sort of complexity
    do { scrambleTiles() } while (checkTiles() < ((giRows + giCols) / 2));
    // Reset game control variables, steps label and play start sound
    gbGameOver = false;
    giSteps = 0;
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    playSound(soundStart);
    // Increment the games played counter and save stats
    stats.gamesPlayed++;
    localStorage.setItem('tilesliderStats', JSON.stringify(stats));
}

function scrambleTiles() {
    // Backup the state of sounds playing game flag before turn it off
    let tempPlaySounds = gbPlaySounds;
    gbPlaySounds = false;
    // Use the levelMovs value to scramble the tiles
    for (var i = 0; i <= levelMovs; i++) {
        // Localize the last tile (the hide one) and extract row and column
        let last = document.getElementById('tile-last');
        let row = parseInt(last.dataset.row);
        let col = parseInt(last.dataset.col);
        // Randomize the type of move: 50% row type, 50% column type
        if (Math.random() < 0.5) {
            // Last tile same row other col
            let colRnd = col;
            while (colRnd == col) {
                colRnd = Math.floor(giCols * Math.random());
            }
            slideTiles(allTiles[row][colRnd]);
        } else {
            // Last tile other row same col
            let rowRnd = row;
            while (rowRnd == row) {
                rowRnd = Math.floor(giRows * Math.random());
            }
            slideTiles(allTiles[rowRnd][col]);
        }
    }
    // Restore the state of sound playing game flag
    gbPlaySounds = tempPlaySounds;
}

function slideTiles(tile) {
    let lastTile = document.getElementById('tile-last');
    let tR = tile.dataset.row - 0;
    let tC = tile.dataset.col - 0;
    var dR = lastTile.dataset.row - tR;
    var dC = lastTile.dataset.col - tC;
    // Validate tile movement
    if ((dR == 0 && dC == 0) || (dR !== 0 && dC !== 0)) {
        // Not valid
        playSound(soundError);
    } else {
        // Valid
        playSound(soundSlide);
        if (dR != 0) {
            // Slide the tile(s) by row
            let sR = Math.sign(dR);
            while (dR != 0) {
                let tile1 = allTiles[tR + dR][tC];
                let tile2 = allTiles[tR + dR - sR][tC];
                swapTiles(tile1, tile2);
                dR -= sR;
            }
        } else {
            // Slide the tile(s) by column
            let sC = Math.sign(dC);
            while (dC != 0) {
                let tile1 = allTiles[tR][tC + dC];
                let tile2 = allTiles[tR][tC + dC - sC];
                swapTiles(tile1, tile2);
                dC -= sC;
            }
        }
    }
}

function swapTiles(tile1, tile2) {
    // Backup tile1 data and style
    let tileTemp = tile1;
    let rowTemp = tile1.dataset.row;
    let colTemp = tile1.dataset.col;
    let topTemp = tile1.style.top;
    let leftTemp = tile1.style.left;
    // Move tile2 to the place of tile1 in the array
    allTiles[tile1.dataset.row][tile1.dataset.col] = tile2;
    // Move tile1 backup to the place of tile2 in the array
    allTiles[tile2.dataset.row][tile2.dataset.col] = tileTemp;
    // Swap row and col data to reflect new positions in the array
    tile1.dataset.row = tile2.dataset.row;
    tile2.dataset.row = rowTemp;
    tile1.dataset.col = tile2.dataset.col;
    tile2.dataset.col = colTemp;
    // Swap position in the gameboard (animated with CSS)
    tile1.style.left = tile2.style.left;
    tile2.style.left = leftTemp;
    tile1.style.top = tile2.style.top;
    tile2.style.top = topTemp;
}

function updateSteps() {
    // Increment the steps counter global var
    giSteps++;
    // Refresh the steps label string with the new value in screen
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    // Detect the game over condition and set the global flag
    gbGameOver = (checkTiles() == 0);
    if (gbGameOver) {
        // Un-hide the last tile and launch the game over display
        document.getElementById('tile-last').classList.remove('hide');
        displayGameOver();
    }
}

function checkTiles() {
    let last = 0;
    let retval = 0;
    // Check all the tiles by row and column
    allTiles.forEach(row => {
        row.forEach(tile => {
            let value = parseInt(tile.value);
            // If values are in disorder increment the couter
            if (value < last) {
                retval++;
            }
            last = value;
        });
    });
    return retval;
}

function displayGameOver() {
    let msg = strings.gameOverScore.replace('?', giSteps);
    // Update game stats values
    stats.gamesEnded++;
    // Use a simple winning or losing criteria
    if (giSteps <= levelMovs) {
        stats.gamesWon++;
        playSound(soundWinner);
        msg += strings.gameOverWin;
    } else {
        playSound(soundGameOver);
        msg += strings.gameOverTry;
    }
    // Calculate a performance index
    let index = Math.floor(Math.min(giSteps - 1, (levelMovs * 2)) / (levelMovs * 2) * 9);
    if (index < 9) {
        stats.performance[index]++;
    }
    // Store stats
    localStorage.setItem('tilesliderStats', JSON.stringify(stats));
    // Use a timer to let the navigator update the display
    setTimeout(function () {
        msgbox(strings.gameOverTitle, msg);
        lblText.textContent = strings.pressStart;
    }, 500);
}

function playSound(sound) {
    if (gbPlaySounds) {
        let audio = new Audio(sound);
        audio.play();
    }
}

/**
 * Modal message box dialog.
 *
 * Displays a message in a modal dialog box, waits for the user to click a button,
 * and send the button click event to the function especified to process the user choice.
 *
 * NOTE: The msgboxClose function need to be called to close the dialog box.
 *
 * Parameters:
 * @param {string} titleText    Required. String expression to display as a header.
 * @param {string} msgText      Required. String expression with the main meesage.
 * @param {array} arrActions    Optional. String or array of strings with the label
 *                              of the buttons to display. If omited, only an Ok button
 *                              will be displayed.
 * @param {function} titleText  A lambda function to process the buttons click event.
 *                              If omitted, the msgboxClose function will be called.
 */
function msgbox(titleText, msgText, arrActions = strings.btnOk, fnOnClick = msgboxClose) {
    const modal = document.getElementById('myModal');
    const msgbox = document.getElementById('msgbox');
    const hText = document.getElementById('hText');
    const pText = document.getElementById('pText');
    const msgboxButtons = document.getElementById('msgboxButtons');
    // Texts in title and message
    hText.textContent = titleText;
    pText.innerHTML = msgText;
    // Force the parameter to an array
    if (!Array.isArray(arrActions)) {
        arrActions = [arrActions];
    }
    // Empty the nav tag (no buttons)
    msgboxButtons.innerHTML = '';
    // Fill the nav tag with all the new buttons
    arrActions.forEach(element => {
        let msgButton = document.createElement('button');
        msgButton.innerText = element;
        msgButton.addEventListener('click', fnOnClick);
        msgboxButtons.appendChild(msgButton);
    });
    // Unhide modal screen and box
    msgbox.style.display = 'block';
    modal.style.display = 'block';
}

function msgboxClose() {
    const modal = document.getElementById('myModal');
    const msgbox = document.getElementById('msgbox');
    modal.style.display = 'none';
    msgbox.style.display = 'none';
}

/**
 * Modal configuration box dialog.
 *
 * Displays a configuration modal dialog box, call the update and display options functions,
 * and let the user change settings.
 */
function configboxOpen() {
    const modal = document.getElementById('myModal');
    const configbox = document.getElementById('configbox');
    const configboxOk = document.getElementById('configboxOk');
    // Update and display options
    updatePlaySounds();
    updateStyleOptions();
    updateColorOptions();
    // Add click event to Ok button to close
    configboxOk.addEventListener('click', configboxClose);
    // Unhide modal screen and box
    modal.style.display = 'block';
    configbox.style.display = 'block';
}

function updatePlaySounds() {
    const imgPlaySoundOn = imagePath + 'ic_action_sounds_on.png';
    const imgPlaySoundOff = imagePath + 'ic_action_sounds_off.png';
    const imgPlaySounds = document.getElementById('imgPlaySounds');
    imgPlaySounds.src = gbPlaySounds ? imgPlaySoundOn : imgPlaySoundOff;
    imgPlaySounds.addEventListener('click', imgPlaySoundsOnClick);
}

function imgPlaySoundsOnClick(e) {
    gbPlaySounds = !gbPlaySounds;
    localStorage.setItem('playSounds', gbPlaySounds);
    updatePlaySounds();
}

function updateStyleOptions() {
    let styleOptions = document.getElementById('configboxTileStyleOptions');
    styleOptions.innerHTML = '';
    Object.keys(config.styles).forEach(element => {
        let img = document.createElement('img');
        img.tag = element;
        img.src = imagePath + config.styles[element].cover;
        img.title = config.styles[element].title;
        if (element === gsTileStyle) {
            img.classList.add('selected');
        } else {
            img.addEventListener('click', imgStyleOptionOnClick);
        }
        styleOptions.appendChild(img);
    });
}

function imgStyleOptionOnClick(e) {
    gsTileStyle = e.target.tag;
    localStorage.setItem('tileStyle', gsTileStyle);
    gsTileScheme = Object.keys(config.styles[gsTileStyle].schemes)[0];
    localStorage.setItem('tileScheme', gsTileScheme);
    updateStyleOptions();
    updateColorOptions();
}

function updateColorOptions() {
    let schemeOptions = document.getElementById('configboxTileSchemeOptions');
    schemeOptions.innerHTML = '';
    Object.keys(config.styles[gsTileStyle].schemes).forEach(element => {
        let img = document.createElement('img');
        img.tag = element;
        img.src = imagePath + config.styles[gsTileStyle].schemes[element].tileImage;
        img.title = config.styles[gsTileStyle].schemes[element].title;
        if (element === gsTileScheme) {
            img.classList.add('selected');
        } else {
            img.addEventListener('click', imgSchemeOptionOnClick);
        }
        schemeOptions.appendChild(img);
    });
}

function imgSchemeOptionOnClick(e) {
    gsTileScheme = e.target.tag;
    localStorage.setItem('tileScheme', gsTileScheme);
    updateColorOptions();
}

function configboxClose() {
    const modal = document.getElementById('myModal');
    const configbox = document.getElementById('configbox');
    gameInitialize();
    gbGameOver = true;
    modal.style.display = 'none';
    configbox.style.display = 'none';
}

/**
 * Modal statistics box dialog.
 *
 * Displays a statistics modal dialog box, call the update and display statistics functions.
 */
function statsboxOpen() {
    const modal = document.getElementById('myModal');
    const statsbox = document.getElementById('statsbox');
    const statsboxOk = document.getElementById('statsboxOk');
    // Update and display options
    updateStats();
    // Add click event to Ok button to close
    statsboxOk.addEventListener('click', statsboxClose);
    // Unhide modal screen and box
    modal.style.display = 'block';
    statsbox.style.display = 'block';
}

function updateStats() {
    // Games
    const statsboxGames = document.getElementById('statsboxGames');
    const statsElements = {
        'gamesPlayed': {
            'label': strings.gamesPlayed || 'Played',
            'value': stats.gamesPlayed
        },
        'gamesEnded': {
            'label': strings.gamesEnded || 'Ended',
            'value': stats.gamesEnded
        },
        'gamesWon': {
            'label': strings.gamesWon || 'Won',
            'value': stats.gamesWon
        }
    };
    statsboxGames.innerHTML = '';
    Object.keys(statsElements).forEach(element => {
        let div = document.createElement('div');
        let label = document.createElement('div');
        let value = document.createElement('div');
        div.classList.add('stats-container');
        label.classList.add('label');
        value.classList.add('value');
        label.innerText = statsElements[element].label;
        value.innerText = statsElements[element].value;
        div.appendChild(value);
        div.appendChild(label);
        statsboxGames.appendChild(div);
    });
    // Graph
    const statsboxGraph = document.getElementById('statsboxGraph');
    statsboxGraph.innerHTML = '';
    let maxCount = 0;
    for (i = 1; i <= 9; i++) {
        let actualCount = stats.performance[i] || 0;
        if (actualCount > maxCount) {
            maxCount = actualCount;
        }
    }
    for (i = 0; i < 9; i++) {
        let div = document.createElement('div');
        let label = document.createElement('div');
        let bar = document.createElement('div');
        let value = document.createElement('div');
        div.classList.add('bar-container');
        label.classList.add('label');
        bar.classList.add('bar');
        value.classList.add('value');
        let actualCount = stats.performance[i] || 0;
        label.innerText = ((10 - i)) + '0%';
        bar.style.width = Math.floor(90 * actualCount / maxCount) + '%';
        value.innerText = actualCount;
        div.appendChild(label);
        bar.appendChild(value);
        div.appendChild(bar);
        statsboxGraph.appendChild(div);
    }
}

function statsboxClose() {
    const modal = document.getElementById('myModal');
    const statsbox = document.getElementById('statsbox');
    modal.style.display = 'none';
    statsbox.style.display = 'none';
}

//
// i18n (internacionalization) implementation
//

const gsDefaultLanguage = document.documentElement.lang;
let gsLanguage;
var strings = {};

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(gsDefaultLanguage);
});

async function setLanguage(newLanguage) {
    if (newLanguage == gsLanguage) return;
    const newStrings = await fetchTranslationsFor(newLanguage);
    gsLanguage = newLanguage;
    strings = newStrings;
    translatePage();
}

async function fetchTranslationsFor(language) {
    const response = await fetch(`./lang/${language}.json`);
    return await response.json();
}

function translatePage() {
    document
        .querySelectorAll('[data-i18n-key]')
        .forEach(translateElement);
}

function translateElement(element) {
    const key = element.getAttribute('data-i18n-key');
    const attr = element.getAttribute('data-i18n-attr') || false;
    const translation = strings[key];
    if (attr) {
        element.setAttribute(attr, translation);
    } else {
        element.innerText = translation;
    }
}

// Executes initializations
run();

// End of code.
