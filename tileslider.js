/**
 * The Switcher Game
 * Javascript code
 * @author Erick Levy <erickevyATgmailDOTcom>
 * @requires config.js The file with the structure for configuration's options (loaded in index.html)
 * @requires strings-xx.js The file with the languaje localized strings where xx: language code [en, es, fr, jp, ...]
 */

// Gameboard setup
let giRows = sessionStorage.getItem('rows') || 4;
let giCols = sessionStorage.getItem('cols') || 4;
let giSpan = sessionStorage.getItem('span') || 1;

// Some Constants
const levelFactor = 2; // 1: Easy, 2: Normal, 3: Hard
const levelMovs = levelFactor * giRows * giCols;

// Some paths
const imagePath = './img/';
const soundPath = './raw/';

// Some defaults
var gbPlaySounds = (localStorage.getItem('playSounds') === 'true');
var tileStyle = localStorage.getItem('tileStyle') || "wood";
var colorScheme = localStorage.getItem('colorScheme') || "brown";

// Default button sound
var soundClick = soundPath + 'switch_tone.mp3';
var soundError = soundPath + 'buzzing_tone.mp3';

// Other sounds
var soundStart = soundPath + 'start_sound.mp3';
var soundWinner = soundPath + 'winner_sound.mp3';
var soundGameOver = soundPath + 'game_over_sound.mp3';

// Collecions

var allTiles = new Array();

// Game control global variables

var giSteps = 0;
var gbGameOver = true;

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

    // Load strings
    lblText.innerText = strings.pressStart || 'Press the START button...';
    appLongName.innerText = strings.appLongName || 'The Switcher Game';
    btnHelp.title = strings.btnHelp || 'Help';
    btnAbout.title = strings.btnAbout || 'About';
    btnStats.title = strings.btnStats || 'Statistics';
    btnConfig.title = strings.btnConfig || 'Configuration';
    btnStart.innerText = strings.btnStart || 'Start';

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
    let rows = giRows;
    let cols = giCols;
    let span = giSpan;
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
            tile.innerText = i;
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
            // Light-dark pattern
            tile.classList.add('tile');
            if ((r + c + 1) % 2 == 0) {
                tile.classList.add('tile-dark');
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
    msgbox(strings.helpTitle, strings.helpMessage);
}

function btnAboutOnClick() {
    msgbox(strings.aboutTitle, strings.aboutMessage);
}

function btnStatsOnClick() {
    statsboxOpen();
}

function btnConfigOnClick() {
    configboxOpen();
}

function btnStartOnClick() {
    if (!gbGameOver) {
        msgbox(strings.restartTitle,
            strings.restartMessage,
            [strings.btnOk, strings.btnCancel],
            msgboxRestart);
    } else {
        restartGame();
    }
}

function msgboxRestart(e) {
    msgboxClose();
    let btnPressed = e.target.innerText;
    if (btnPressed === strings.btnOk) {
        restartGame();
    }
}

function restartGame() {
    do { scrambleTiles() } while (checkTiles() < ((giRows + giCols) / 2));
    gbGameOver = false;
    giSteps = 0;
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    playSound(soundStart);
    // Increment the games played counter
    let gamesPlayed = localStorage.getItem('gamesPlayed') || 0;
    localStorage.setItem('gamesPlayed', ++gamesPlayed);
}

function scrambleTiles() {
    let tempPlaySounds = gbPlaySounds;
    gbPlaySounds = false;
    for (var i = 0; i <= levelMovs; i++) {
        let last = document.getElementById('tile-last');
        let row = parseInt(last.dataset.row);
        let col = parseInt(last.dataset.col);
        if (Math.random() < 0.5) {
            // Same row random col
            let colRnd = col;
            while (colRnd == col) {
                colRnd = Math.floor(giCols * Math.random());
            }
            slideTiles(allTiles[row][colRnd]);
        } else {
            // Random row same col
            let rowRnd = row;
            while (rowRnd == row) {
                rowRnd = Math.floor(giRows * Math.random());
            }
            slideTiles(allTiles[rowRnd][col]);
        }
    }
    gbPlaySounds = tempPlaySounds;
    document.getElementById('tile-last').classList.add('hide');
}

function slideTiles(tile) {
    let lastTile = document.getElementById('tile-last');
    let tR = tile.dataset.row - 0;
    let tC = tile.dataset.col - 0;
    var dR = lastTile.dataset.row - tR;
    var dC = lastTile.dataset.col - tC;
    if ((dR == 0 && dC == 0) || (dR !== 0 && dC !== 0)) {
        // Invalid slide
        playSound(soundError);
    } else {
        playSound(soundClick);
        if (dR != 0) {
            // Row slide
            let sR = Math.sign(dR);
            while (dR != 0) {
                let tile1 = allTiles[tR + dR][tC];
                let tile2 = allTiles[tR + dR - sR][tC];
                swapTiles(tile1, tile2);
                dR -= sR;
            }
        } else {
            // Column slide
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
    // Swap array position
    let tileTemp = tile1;
    let rowTemp = tile1.dataset.row;
    let colTemp = tile1.dataset.col;
    let topTemp = tile1.style.top;
    let leftTemp = tile1.style.left;
    allTiles[tile1.dataset.row][tile1.dataset.col] = tile2;
    allTiles[tile2.dataset.row][tile2.dataset.col] = tileTemp;
    // Swap rows and cols
    tile1.dataset.row = tile2.dataset.row;
    tile2.dataset.row = rowTemp;
    tile1.dataset.col = tile2.dataset.col;
    tile2.dataset.col = colTemp;
    // Change positions in the gameboard
    tile1.style.left = tile2.style.left;
    tile2.style.left = leftTemp;
    tile1.style.top = tile2.style.top;
    tile2.style.top = topTemp;
}

function updateSteps() {
    giSteps++;
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    gbGameOver = (checkTiles() == 0);
    if (gbGameOver) {
        document.getElementById('tile-last').classList.remove('hide');
        displayGameOver();
    }
}

function checkTiles() {
    gbGameOver = true;
    let last = 0;
    let retval = 0;
    allTiles.forEach(row => {
        row.forEach(tile => {
            let value = parseInt(tile.value);
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
    if (giSteps <= levelMovs) {
        playSound(soundWinner);
        msg += strings.gameOverWin;
        // Store the step counter for stats
        let stepsCount = 'stepsCount' + giSteps;
        let lastCount = localStorage.getItem(stepsCount) || 0;
        localStorage.setItem(stepsCount, ++lastCount);
        // Increment the games winned counter
        let gamesWinned = localStorage.getItem('gamesWinned') || 0;
        localStorage.setItem('gamesWinned', ++gamesWinned);
    } else {
        playSound(soundGameOver);
        msg += strings.gameOverTry;
    }
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

function configboxOpen() {
    const modal = document.getElementById('myModal');
    const configbox = document.getElementById('configbox');
    const configboxOk = document.getElementById('configboxOk');
    // Load label strings
    document.getElementById('configboxTitle').innerText
        = strings.configboxTitle || 'Configuration';
    document.getElementById('configboxPlaySoundsLabel').innerText
        = strings.configboxPlaySoundsLabel || 'Play sounds:';
    document.getElementById('configboxSwitchStyleLabel').innerText
        = strings.configboxSwitchStyleLabel || 'Switch style:';
    document.getElementById('configboxColorSchemeLabel').innerText
        = strings.configboxColorSchemeLabel || 'Color scheme:';
    configboxOk.innerText = strings.btnOk;
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
    let styleOptions = document.getElementById('configboxSwitchStyleOptions');
    styleOptions.innerHTML = '';
    Object.keys(config.styles).forEach(element => {
        // let img = document.createElement('img');
        // img.tag = element;
        // img.src = imagePath + config.styles[element].cover;
        // img.title = config.styles[element].title;
        // if (element === switchStyle) {
        //     img.classList.add('selected');
        // } else {
        //     img.addEventListener('click', imgStyleOptionOnClick);
        // }
        // styleOptions.appendChild(img);
    });
}

function imgStyleOptionOnClick(e) {
    switchStyle = e.target.tag;
    localStorage.setItem('switchStyle', switchStyle);
    updateStyleOptions();
    updateColorOptions();
}

function updateColorOptions() {
    // let colorOptions = document.getElementById('configboxColorSchemeOptions');
    // colorOptions.innerHTML = '';
    // Object.keys(config.styles[switchStyle].colors).forEach(element => {
    //     let img = document.createElement('img');
    //     img.tag = element;
    //     img.src = imagePath + config.styles[switchStyle].colors[element].on;
    //     img.title = config.styles[switchStyle].colors[element].title;
    //     if (element === colorScheme) {
    //         img.classList.add('selected');
    //     } else {
    //         img.addEventListener('click', imgColorOptionOnClick);
    //     }
    //     colorOptions.appendChild(img);
    // });
}

function imgColorOptionOnClick(e) {
    colorScheme = e.target.tag;
    localStorage.setItem('colorScheme', colorScheme);
    updateColorOptions();
}

function configboxClose() {
    const modal = document.getElementById('myModal');
    const configbox = document.getElementById('configbox');
    //redrawButtons();
    modal.style.display = 'none';
    configbox.style.display = 'none';
}

function statsboxOpen() {
    const modal = document.getElementById('myModal');
    const statsbox = document.getElementById('statsbox');
    const statsboxOk = document.getElementById('statsboxOk');
    // Load label strings
    document.getElementById('statsboxTitle').innerText = strings.statsboxTitle || 'Statistics';
    document.getElementById('statsboxGamesLabel').innerText = strings.statsboxGamesLabel || 'Games';
    document.getElementById('statsboxGraphLabel').innerText = strings.statsboxGraphLabel || 'Steps Distribution Graph';
    statsboxOk.innerText = strings.btnOk;
    // Update and display options
    updateStats();
    // Add click event to Ok button to close
    statsboxOk.addEventListener('click', statsboxClose);
    // Unhide modal screen and box
    modal.style.display = 'block';
    statsbox.style.display = 'block';
}

function updateStats() {
    // // Games
    // const statsboxGames = document.getElementById('statsboxGames');
    // const played = localStorage.getItem('gamesPlayed') || 0;
    // const won = localStorage.getItem('gamesWinned') || 0;
    // const percent = (played > 0) ? Math.round(100 * won / played) : 0;
    // const stats = {
    //     'gamesPlayed': {
    //         'label': strings.gamesPlayed || 'Played',
    //         'value': played
    //     },
    //     'gamesWinned': {
    //         'label': strings.gamesWinned || 'Winned',
    //         'value': won
    //     },
    //     'porcWinned': {
    //         'label': strings.gamesPercentage || 'Percentage',
    //         'value': percent + '%'
    //     }
    // };
    // statsboxGames.innerHTML = '';
    // Object.keys(stats).forEach(element => {
    //     let div = document.createElement('div');
    //     let label = document.createElement('div');
    //     let value = document.createElement('div');
    //     div.classList.add('stats-container');
    //     label.classList.add('label');
    //     value.classList.add('value');
    //     label.innerText = stats[element].label;
    //     value.innerText = stats[element].value;
    //     div.appendChild(value);
    //     div.appendChild(label);
    //     statsboxGames.appendChild(div);
    // });
    // // Graph
    // const statsboxGraph = document.getElementById('statsboxGraph');
    // statsboxGraph.innerHTML = '';
    // let maxCount = 0;
    // for (i = 1; i <= 9; i++) {
    //     let actualCount = localStorage.getItem('stepsCount' + i) || 0;
    //     if (actualCount > maxCount) {
    //         maxCount = actualCount;
    //     }
    // }
    // for (i = 1; i <= 9; i++) {
    //     let div = document.createElement('div');
    //     let label = document.createElement('div');
    //     let bar = document.createElement('div');
    //     let value = document.createElement('div');
    //     div.classList.add('bar-container');
    //     label.classList.add('label');
    //     bar.classList.add('bar');
    //     value.classList.add('value');
    //     let actualCount = localStorage.getItem('stepsCount' + i) || 0;
    //     label.innerText = i;
    //     bar.style.width = Math.floor(90 * actualCount / maxCount) + '%';
    //     value.innerText = actualCount;
    //     div.appendChild(label);
    //     bar.appendChild(value);
    //     div.appendChild(bar);
    //     statsboxGraph.appendChild(div);
    // }
}

function statsboxClose() {
    const modal = document.getElementById('myModal');
    const statsbox = document.getElementById('statsbox');
    modal.style.display = 'none';
    statsbox.style.display = 'none';
}

// Executes initializations
run();

// End of code.
