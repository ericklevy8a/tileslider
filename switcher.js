/**
 * The Switcher Game
 * Javascript code
 * @author Erick Levy <erickevyATgmailDOTcom>
 * @requires config.js The file with the structure for configuration's options (loaded in index.html)
 * @requires strings-xx.js The file with the languaje localized strings where xx: language code [en, es, fr, jp, ...]
 */

// Some Constants
const buttonOff = false;
const buttonOn = true;

// Some paths
const imagePath = './img/';
const soundPath = './raw/';

// Some defaults
var gbPlaySounds = (localStorage.getItem('playSounds') === 'true');
var switchStyle = localStorage.getItem('switchStyle') || "sw";
var colorScheme = localStorage.getItem('colorScheme') || "grn_red";

// Default button images
var imageOn = imagePath + config.styles[switchStyle].colors[colorScheme].on;
var imageOff = imagePath + config.styles[switchStyle].colors[colorScheme].off;

// Default button sound
var soundClick = soundPath + config.styles[switchStyle].sound;

// Other sounds
var soundStart = soundPath + 'start_sound.mp3';
var soundWinner = soundPath + 'winner_sound.mp3';
var soundGameOver = soundPath + 'game_over_sound.mp3';

// Collecions

var allButtons = new Array();

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

const btnSwitch1 = document.getElementById('btnSwitch1');
const btnSwitch2 = document.getElementById('btnSwitch2');
const btnSwitch3 = document.getElementById('btnSwitch3');
const btnSwitch4 = document.getElementById('btnSwitch4');
const btnSwitch5 = document.getElementById('btnSwitch5');
const btnSwitch6 = document.getElementById('btnSwitch6');
const btnSwitch7 = document.getElementById('btnSwitch7');
const btnSwitch8 = document.getElementById('btnSwitch8');
const btnSwitch9 = document.getElementById('btnSwitch9');

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

    btnSwitch1.addEventListener('click', btnSwitch1OnClick);
    btnSwitch2.addEventListener('click', btnSwitch2OnClick);
    btnSwitch3.addEventListener('click', btnSwitch3OnClick);
    btnSwitch4.addEventListener('click', btnSwitch4OnClick);
    btnSwitch5.addEventListener('click', btnSwitch5OnClick);
    btnSwitch6.addEventListener('click', btnSwitch6OnClick);
    btnSwitch7.addEventListener('click', btnSwitch7OnClick);
    btnSwitch8.addEventListener('click', btnSwitch8OnClick);
    btnSwitch9.addEventListener('click', btnSwitch9OnClick);

    gameInitialize();
}

// Game initialization
function gameInitialize() {
    allButtons = new Array();
    allButtons.push(btnSwitch1);
    allButtons.push(btnSwitch2);
    allButtons.push(btnSwitch3);
    allButtons.push(btnSwitch4);
    allButtons.push(btnSwitch5);
    allButtons.push(btnSwitch6);
    allButtons.push(btnSwitch7);
    allButtons.push(btnSwitch8);
    allButtons.push(btnSwitch9);
    allButtons.forEach(element => {
        element.src = imageOn;
        element.tag = buttonOn;
    });
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
    randomizeButtons();
    giSteps = 0;
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    gbGameOver = false;
    playSound(soundStart);
    // Increment the games played counter
    let gamesPlayed = localStorage.getItem('gamesPlayed') || 0;
    localStorage.setItem('gamesPlayed', ++gamesPlayed);
}

function randomizeButtons() {
    allButtons.forEach(element => {
        if (Math.random() < 0.5) {
            element.src = imageOff;
            element.tag = buttonOff;
        } else {
            element.src = imageOn;
            element.tag = buttonOn;
        }
    });
}

function redrawButtons() {
    soundClick = soundPath + config.styles[switchStyle].sound;
    imageOn = imagePath + config.styles[switchStyle].colors[colorScheme].on;
    imageOff = imagePath + config.styles[switchStyle].colors[colorScheme].off;
    allButtons.forEach(element => {
        if (element.tag === buttonOff) {
            element.src = imageOff;
            element.tag = buttonOff;
        } else {
            element.src = imageOn;
            element.tag = buttonOn;
        }
    });
}

function switchButton(button) {
    let element = allButtons[button - 1];
    if (element.tag === buttonOff) {
        element.src = imageOn;
        element.tag = buttonOn;
    } else {
        element.src = imageOff;
        element.tag = buttonOff;
    }
}

function switchButtons(buttons) {
    if (!gbGameOver) {
        if (Array.isArray(buttons)) {
            buttons.forEach(element => {
                switchButton(element);
            });
            updateSteps();
            playSound(soundClick);
        }
    }
}

function btnSwitch1OnClick() {
    switchButtons([1, 2, 4]);
}

function btnSwitch2OnClick() {
    switchButtons([2, 1, 3, 5]);
}

function btnSwitch3OnClick() {
    switchButtons([3, 2, 6]);
}

function btnSwitch4OnClick() {
    switchButtons([4, 1, 5, 7]);
}

function btnSwitch5OnClick() {
    switchButtons([5, 2, 4, 6, 8]);
}

function btnSwitch6OnClick() {
    switchButtons([6, 3, 5, 9]);
}

function btnSwitch7OnClick() {
    switchButtons([7, 4, 8]);
}

function btnSwitch8OnClick() {
    switchButtons([8, 5, 7, 9]);
}

function btnSwitch9OnClick() {
    switchButtons([9, 6, 8]);
}

function updateSteps() {
    giSteps++;
    lblText.textContent = strings.lblSteps.replace('?', giSteps);
    checkButtons();
    if (gbGameOver) {
        displayGameOver();
    }
}

function checkButtons() {
    gbGameOver = true;
    allButtons.forEach(element => {
        if (element.tag === false) {
            gbGameOver = false;
        }
    });
}

function displayGameOver() {
    let msg = strings.gameOverScore.replace('?', giSteps);
    if (giSteps <= 9) {
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
        let img = document.createElement('img');
        img.tag = element;
        img.src = imagePath + config.styles[element].cover;
        img.title = config.styles[element].title;
        if (element === switchStyle) {
            img.classList.add('selected');
        } else {
            img.addEventListener('click', imgStyleOptionOnClick);
        }
        styleOptions.appendChild(img);
    });
}

function imgStyleOptionOnClick(e) {
    switchStyle = e.target.tag;
    localStorage.setItem('switchStyle', switchStyle);
    updateStyleOptions();
    updateColorOptions();
}

function updateColorOptions() {
    let colorOptions = document.getElementById('configboxColorSchemeOptions');
    colorOptions.innerHTML = '';
    Object.keys(config.styles[switchStyle].colors).forEach(element => {
        let img = document.createElement('img');
        img.tag = element;
        img.src = imagePath + config.styles[switchStyle].colors[element].on;
        img.title = config.styles[switchStyle].colors[element].title;
        if (element === colorScheme) {
            img.classList.add('selected');
        } else {
            img.addEventListener('click', imgColorOptionOnClick);
        }
        colorOptions.appendChild(img);
    });
}

function imgColorOptionOnClick(e) {
    colorScheme = e.target.tag;
    localStorage.setItem('colorScheme', colorScheme);
    updateColorOptions();
}

function configboxClose() {
    const modal = document.getElementById('myModal');
    const configbox = document.getElementById('configbox');
    redrawButtons();
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
    // Games
    const statsboxGames = document.getElementById('statsboxGames');
    const played = localStorage.getItem('gamesPlayed') || 0;
    const won = localStorage.getItem('gamesWinned') || 0;
    const percent = (played > 0) ? Math.round(100 * won / played) : 0;
    const stats = {
        'gamesPlayed': {
            'label': strings.gamesPlayed || 'Played',
            'value': played
        },
        'gamesWinned': {
            'label': strings.gamesWinned || 'Winned',
            'value': won
        },
        'porcWinned': {
            'label': strings.gamesPercentage || 'Percentage',
            'value': percent + '%'
        }
    };
    statsboxGames.innerHTML = '';
    Object.keys(stats).forEach(element => {
        let div = document.createElement('div');
        let label = document.createElement('div');
        let value = document.createElement('div');
        div.classList.add('stats-container');
        label.classList.add('label');
        value.classList.add('value');
        label.innerText = stats[element].label;
        value.innerText = stats[element].value;
        div.appendChild(value);
        div.appendChild(label);
        statsboxGames.appendChild(div);
    });
    // Graph
    const statsboxGraph = document.getElementById('statsboxGraph');
    statsboxGraph.innerHTML = '';
    let maxCount = 0;
    for (i = 1; i <= 9; i++) {
        let actualCount = localStorage.getItem('stepsCount' + i) || 0;
        if (actualCount > maxCount) {
            maxCount = actualCount;
        }
    }
    for (i = 1; i <= 9; i++) {
        let div = document.createElement('div');
        let label = document.createElement('div');
        let bar = document.createElement('div');
        let value = document.createElement('div');
        div.classList.add('bar-container');
        label.classList.add('label');
        bar.classList.add('bar');
        value.classList.add('value');
        let actualCount = localStorage.getItem('stepsCount' + i) || 0;
        label.innerText = i;
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

// Executes initializations
run();

// End of code.
