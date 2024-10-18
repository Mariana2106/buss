let rows, cols, mineCount;

// Función para cargar la configuración del juego desde JSON
async function loadGameConfig() {
    const response = await fetch('config.json');
    const config = await response.json();
    return config;
}

// Cargar los puntajes más altos
async function loadHighScores() {
    const config = await loadGameConfig();
    return config.highScores || [];
}

// Inicializar el juego
async function initGame() {
    const config = await loadGameConfig();
    if (config) {
        rows = config.rows;
        cols = config.columns;
        mineCount = config.mines;

        createBoard(rows, cols);
        placeMines(rows, cols, mineCount);
        addEventListeners();
    }
    displayHighScores();
}

// Mostrar los puntajes más altos en la interfaz
async function displayHighScores() {
    const scores = await loadHighScores();
    const scoreBoard = document.getElementById('high-scores');
    scoreBoard.innerHTML = '';

    scores.forEach(score => {
        const scoreItem = document.createElement('li');
        scoreItem.textContent = `${score.player} - ${score.time} segundos - ${score.date}`;
        scoreBoard.appendChild(scoreItem);
    });
}

// Crear el tablero
function createBoard(rows, cols) {
    const board = document.getElementById("board");
    board.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = i;
            cell.dataset.col = j;
            board.appendChild(cell);
        }
    }
}

// Colocar minas aleatoriamente
function placeMines(rows, cols, mineCount) {
    let mines = 0;
    while (mines < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell.classList.contains("mine")) {
            cell.classList.add("mine");
            mines++;
        }
    }
}

// Verificar victoria
function checkVictory() {
    const totalCells = document.querySelectorAll(".cell").length;
    const revealedCells = document.querySelectorAll(".cell.revealed").length;

    if (totalCells - revealedCells === mineCount) {
        showMessage("You Win!");
        revealAllCell();
        saveScore();
    }
}

// Guardar un nuevo puntaje al ganar
async function saveScore() {
    const player = prompt("¡Ganaste! Ingresa tu nombre:");
    const time = Math.floor(Math.random() * 100); // Simulación del tiempo
    const newScore = {
        player: player,
        time: time,
        date: new Date().toISOString().split('T')[0]
    };
    
    console.log("Nuevo puntaje:", newScore);
    // Aquí podrías implementar lógica para guardar el nuevo puntaje en un backend o API
}

// Agregar eventos a las celdas
function addEventListeners() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("click", handleClick);
        cell.addEventListener("contextmenu", handleRightClick);
    });

    document.getElementById("reset-button").addEventListener("click", resetGame);
    document.getElementById("instructions-button").addEventListener("click", showInstructions);
}

// Manejar clics y reinicio
function handleClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    revealCell(row, col);
}

function handleRightClick(event) {
    event.preventDefault();
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    markCell(row, col);
}

function resetGame() {
    document.getElementById("board").innerHTML = "";
    initGame();
}

// Mostrar mensaje emergente
function showMessage(message) {
    const dialog = document.getElementById("dialog");
    const messageElement = document.getElementById("dialog-message");
    const okButton = document.getElementById("dialog-ok");

    messageElement.textContent = message;
    dialog.style.display = "block";

    okButton.onclick = function() {
        dialog.style.display = "none";
    };
}

// Iniciar el juego al cargar la página
window.onload = initGame;
