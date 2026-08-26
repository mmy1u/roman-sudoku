function createEmptyGrid() {
    const grid = [];
    for (let row = 0; row < 9; row++) {
        grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return grid;
}

function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num) {
            return false;
        }
    }

    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) {
            return false;
        }
    }

    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (grid[boxRowStart + r][boxColStart + c] === num) {
                return false;
            }
        }
    }

    return true;
}

function fillGrid(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {

            if (grid[row][col] === 0) {

                for (let num = 1; num <= 9; num++) {

                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;

                        if (fillGrid(grid)) {
                            return true;
                        }

                        grid[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }
    return true;
}

function createPuzzle(solvedGrid, cellsToRemove) {
    const puzzle = solvedGrid.map(row => row.slice());

    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }

    return puzzle;
}

function checkWin() {
    const cells = document.querySelectorAll(".cell");

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const correctNumber = sudokuGrid[row][col];
        const correctNumeral = romanNumerals[correctNumber - 1];

        if (cell.textContent !== correctNumeral) {
            return false;
        }
    }

    return true;
}

function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {

            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            const numberInCell = puzzleGrid[row][col];

            if (numberInCell !== 0) {
                cell.textContent = romanNumerals[numberInCell - 1];
                cell.classList.add("given");
            } else {
                cell.classList.add("editable");
            }

            cell.addEventListener("click", function() {
                document.querySelectorAll(".cell").forEach(function(c) {
                    c.classList.remove("selected");
                    c.classList.remove("highlighted");
                    c.classList.remove("related");
                });

                cell.classList.add("selected");

                if (cell.classList.contains("editable")) {
                    selectedCell = cell;
                }

                const clickedRow = parseInt(cell.dataset.row);
                const clickedCol = parseInt(cell.dataset.col);
                const boxRowStart = Math.floor(clickedRow / 3) * 3;
                const boxColStart = Math.floor(clickedCol / 3) * 3;

                document.querySelectorAll(".cell").forEach(function(c) {
                    const r = parseInt(c.dataset.row);
                    const cCol = parseInt(c.dataset.col);
                    const inSameRow = r === clickedRow;
                    const inSameCol = cCol === clickedCol;
                    const inSameBox = r >= boxRowStart && r < boxRowStart + 3 &&
                                       cCol >= boxColStart && cCol < boxColStart + 3;

                    if ((inSameRow || inSameCol || inSameBox) && c !== cell) {
                        c.classList.add("related");
                    }
                });

                if (cell.textContent !== "") {
                    document.querySelectorAll(".cell").forEach(function(c) {
                        if (c.textContent === cell.textContent && c !== cell) {
                            c.classList.add("highlighted");
                        }
                    });
                }
            });

            board.appendChild(cell);
        }
    }
}

function applyBoxBorders() {
    const cells = document.querySelectorAll(".cell");

    cells.forEach(function(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (col % 3 === 0 && col !== 0) {
            cell.style.borderLeft = "3px solid #3D2645";
        }
        if (row % 3 === 0 && row !== 0) {
            cell.style.borderTop = "3px solid #3D2645";
        }
    });
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;

    const minutesText = minutes < 10 ? "0" + minutes : minutes;
    const secondsText = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("timer").textContent = "⏱️ " + minutesText + ":" + secondsText;
}

function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    updateTimerDisplay();

    timerInterval = setInterval(function() {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateErrorDisplay() {
    document.getElementById("errorCount").textContent = "❌ " + errorCount;
}

function startNewGame() {
    sudokuGrid = createEmptyGrid();
    fillGrid(sudokuGrid);

    const cellsToRemove = difficultyLevels[currentDifficulty];
    puzzleGrid = createPuzzle(sudokuGrid, cellsToRemove);
    originalPuzzleGrid = puzzleGrid.map(row => row.slice());

    selectedCell = null;
    errorCount = 0;
    moveHistory = [];
    updateErrorDisplay();

    document.getElementById("winMessage").style.display = "none";

    renderBoard();
    applyBoxBorders();
    startTimer();
}

function restartPuzzle() {
    puzzleGrid = originalPuzzleGrid.map(row => row.slice());

    selectedCell = null;
    errorCount = 0;
    moveHistory = [];
    updateErrorDisplay();

    document.getElementById("winMessage").style.display = "none";

    renderBoard();
    applyBoxBorders();
    startTimer();
}

function undoMove() {
    if (moveHistory.length === 0) {
        return;
    }

    const lastMove = moveHistory.pop();
    lastMove.cell.textContent = lastMove.previousValue;
    lastMove.cell.classList.remove("error");
}

function checkBoard() {
    const cells = document.querySelectorAll(".editable");

    cells.forEach(function(cell) {
        if (cell.textContent === "") {
            return;
        }

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const correctNumeral = romanNumerals[sudokuGrid[row][col] - 1];

        if (cell.textContent === correctNumeral) {
            cell.classList.remove("error");
        } else {
            cell.classList.add("error");
        }
    });
}

function giveHint() {
    if (selectedCell === null) {
        return;
    }

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    const correctNumeral = romanNumerals[sudokuGrid[row][col] - 1];

    moveHistory.push({
        cell: selectedCell,
        previousValue: selectedCell.textContent
    });

    selectedCell.textContent = correctNumeral;
    selectedCell.classList.remove("error");

    if (checkWin()) {
        clearInterval(timerInterval);
        document.getElementById("winMessage").textContent = "🎉 مبروك! حللت اللغز بنجاح!";
        document.getElementById("winMessage").style.display = "block";
    }
}

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const board = document.getElementById("board");
const numberPad = document.getElementById("numberPad");

const difficultyLevels = {
    easy: 30,
    medium: 40,
    hard: 50,
    expert: 58
};

let currentDifficulty = "medium";
let sudokuGrid;
let puzzleGrid;
let originalPuzzleGrid;
let selectedCell = null;
let secondsElapsed = 0;
let timerInterval;
let errorCount = 0;
let moveHistory = [];

romanNumerals.forEach(function(numeral) {
    const btn = document.createElement("div");
    btn.classList.add("num-btn");
    btn.textContent = numeral;

    btn.addEventListener("click", function() {
        if (selectedCell !== null) {

            moveHistory.push({
                cell: selectedCell,
                previousValue: selectedCell.textContent
            });

            selectedCell.textContent = numeral;

            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            const correctNumber = sudokuGrid[row][col];

            if (numeral === romanNumerals[correctNumber - 1]) {
                selectedCell.classList.remove("error");
            } else {
                selectedCell.classList.add("error");
                errorCount++;
                updateErrorDisplay();
            }

            if (checkWin()) {
                clearInterval(timerInterval);
                document.getElementById("winMessage").textContent = "🎉 مبروك! حللت اللغز بنجاح!";
                document.getElementById("winMessage").style.display = "block";
            }
        }
    });

    numberPad.appendChild(btn);
});

document.getElementById("newGameBtn").addEventListener("click", function() {
    startNewGame();
});

document.getElementById("restartBtn").addEventListener("click", function() {
    restartPuzzle();
});

document.getElementById("undoBtn").addEventListener("click", function() {
    undoMove();
});

document.getElementById("checkBtn").addEventListener("click", function() {
    checkBoard();
});

document.getElementById("hintBtn").addEventListener("click", function() {
    giveHint();
});

const difficultyButtons = document.querySelectorAll(".diff-btn");

difficultyButtons.forEach(function(btn) {
    if (btn.dataset.level === currentDifficulty) {
        btn.classList.add("active");
    }

    btn.addEventListener("click", function() {
        difficultyButtons.forEach(function(b) {
            b.classList.remove("active");
        });
        btn.classList.add("active");

        currentDifficulty = btn.dataset.level;
        startNewGame();
    });
});

startNewGame();