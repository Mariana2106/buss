let rows, cols, mineCount; // Definir variables globales

// Función para cargar la configuración del juego desde config.json
async function loadGameConfig() {
    const response = await fetch('config.json');
    const config = await response.json();
    return config;
}

// Función para inicializar el juego utilizando la configuración cargada
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
}

// Cada celda es un div que representa una casilla, con un atributo data-row y data-col que indica la fila y columna de la celda
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

// Coloca las minas en celdas aleatorias
// Se verifica que no se coloquen dos minas en la misma celda
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

// Cuenta las minas adyacentes a una celda específica
function calculateAdjacentMines(row, col) {
    let adjacentMines = 0;
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < rows && j >= 0 && j < cols) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (cell && cell.classList.contains("mine")) {
                    adjacentMines++;
                }
            }
        }
    }
    return adjacentMines;
}

// Revela una celda específica
function revealCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (cell.classList.contains("revealed")) {
        return;
    }

    cell.classList.add("revealed");

    if (cell.classList.contains("mine")) {
        cell.classList.add("mine-revealed");
        showMessage("Game Over");
        revealAllCell();
        return;
    }

    const adjacentMines = calculateAdjacentMines(row, col);
    if (adjacentMines > 0) {
        cell.textContent = adjacentMines;
        cell.classList.add("number");
    } else {
        cell.classList.add("empty");
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    if (!(i === row && j === col)) {
                        revealCell(i, j);
                    }
                }
            }
        }
    }
    checkVictory();
}

// Verifica si el jugador ha ganado el juego
function checkVictory() {
    const totalCells = document.querySelectorAll(".cell").length;
    const revealedCells = document.querySelectorAll(".cell.revealed").length;

    if (totalCells - revealedCells === mineCount) {
        showMessage("You Win!");
        revealAllCell();
    }
}

// Marca una celda con una bandera
function markCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains("marked")) {
        cell.classList.remove("marked");
    } else {
        cell.classList.add("marked");
    }
}

// Revela todas las celdas del tablero
function revealAllCell() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.add("revealed");
        if (cell.classList.contains("mine")) {
            cell.classList.add("mine-revealed");
        }
    });
}

// Función para agregar los eventos
function addEventListeners() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("click", handleClick);
        cell.addEventListener("contextmenu", handleRightClick);
    });

    document.getElementById("reset-button").addEventListener("click", resetGame);
    document.getElementById("instructions-button").addEventListener("click", showInstructions);
}

// Función para manejar el click
function handleClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    revealCell(row, col);
}

// Función para manejar el click derecho
function handleRightClick(event) {
    event.preventDefault();
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    markCell(row, col);
}

// Reinicia el juego
function resetGame() {
    document.getElementById("board").innerHTML = "";
    initGame();
}

// Muestra un mensaje en un diálogo emergente
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

// Muestra las instrucciones del juego
function showInstructions() {
    const instructions = `
        ¡Bienvenido a Buscaminas!
        - Haz clic en las celdas para revelarlas.
        - El número en una celda indica cuántas minas hay alrededor de esa celda.
        - Si revelas una mina, pierdes.
        - Marca las celdas sospechosas de tener minas con clic derecho.
        ¡Buena suerte!
    `;

    const instructionsDialog = document.getElementById("instructions-dialog");
    const instructionsMessage = document.getElementById("instructions-message");
    const instructionsOkButton = document.getElementById("instructions-ok");

    instructionsMessage.textContent = instructions;
    instructionsDialog.style.display = "block";

    instructionsOkButton.onclick = function() {
        instructionsDialog.style.display = "none";
    };
}

window.onload = initGame;
