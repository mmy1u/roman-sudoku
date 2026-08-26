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
const sudokuGrid = createEmptyGrid();
fillGrid(sudokuGrid);

const puzzleGrid = createPuzzle(sudokuGrid, 40);

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const board = document.getElementById("board");
let selectedCell = null;

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

            cell.addEventListener("click", function() {
                document.querySelectorAll(".cell").forEach(function(c) {
                    c.classList.remove("selected");
                });
                cell.classList.add("selected");
                selectedCell = cell;
            });
        }

        board.appendChild(cell);
    }
}

const numberPad = document.getElementById("numberPad");

romanNumerals.forEach(function(numeral) {
    const btn = document.createElement("div");
    btn.classList.add("num-btn");
    btn.textContent = numeral;

    btn.addEventListener("click", function() {
        if (selectedCell !== null) {
            selectedCell.textContent = numeral;

            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            const correctNumber = sudokuGrid[row][col];

            if (numeral === romanNumerals[correctNumber - 1]) {
                selectedCell.classList.remove("error");
            } else {
                selectedCell.classList.add("error");
            }
        }
    });

    numberPad.appendChild(btn);
});