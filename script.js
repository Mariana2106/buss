let rows, cols, mineCount, startTime, board;

async function loadGameConfig() {
    const response = await fetch('config.json');
    return await response.json();
}

async function loadHighScores() {
    const config = await loadGameConfig();
    return config.highScores || [];
}

async function initGame() {
    const config = await loadGameConfig();
    rows = config.rows;
    cols = config.columns;
    mineCount = config.mines;

    createBoard(rows, cols);
    placeMines(mineCount);
    addEventListeners();
    startTime = new Date(); // Inicia temporizador
    displayHighScores();
}

function displayHighScores() {
    loadHighScores().then(scores => {
        const scoreBoard = document.getElementById('high-scores');
        scoreBoard.innerHTML = '';

        scores.forEach(score => {
            const scoreItem = document.createElement('li');
            scoreItem.textContent = `${score.player} - ${score.time} segundos`;
            scoreBoard.appendChild(scoreItem);
        });
    });
}

function createBoard(rows, cols) {
    board = document.getElementById('board');
    board.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            board.appendChild(cell);
        }
    }
}

function placeMines(mineCount) {
    let mines = 0;
    while (mines < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell.classList.contains('mine')) {
            cell.classList.add('mine');
            mines++;
        }
    }
}

function revealCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('mine')) {
        showMessage('¡Perdiste!');
        revealAllMines();
    } else {
        cell.classList.add('revealed');
        checkVictory();
    }
}

function revealAllMines() {
    const mines = document.querySelectorAll('.mine');
    mines.forEach(mine => mine.classList.add('mine-revealed'));
}

function checkVictory() {
    const totalCells = document.querySelectorAll('.cell').length;
    const revealedCells = document.querySelectorAll('.cell.revealed').length;

    if (totalCells - revealedCells === mineCount) {
        showMessage('¡Ganaste!');
        saveScore();
    }
}

function saveScore() {
    const player = prompt('¡Ganaste! Ingresa tu nombre:');
    const time = Math.floor((new Date() - startTime) / 1000);
    const newScore = { player, time };

    // Aquí se podrían guardar los puntajes en un backend o archivo
    console.log('Nuevo puntaje:', newScore);
}

function addEventListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleClick);
    });

    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('instructions-button').addEventListener('click', showInstructions);
}

function handleClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    revealCell(row, col);
}

function resetGame() {
    document.getElementById('board').innerHTML = '';
    initGame();
}

function showMessage(message) {
    const dialog = document.getElementById('dialog');
    const messageElement = document.getElementById('dialog-message');
    const okButton = document.getElementById('dialog-ok');

    messageElement.textContent = message;
    dialog.style.display = 'block';

    okButton.onclick = function () {
        dialog.style.display = 'none';
    };
}

window.onload = initGame;
