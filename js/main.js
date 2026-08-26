function createEmptyGrid() {
    const grid = [];
    for (let row = 0; row < 9; row++) {
        grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return grid;
}

function isValid(grid, row, col, num) {
    // تحقق 1: هل الرقم موجود بنفس الصف؟
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num) {
            return false;
        }
    }

    // تحقق 2: هل الرقم موجود بنفس العمود؟
    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) {
            return false;
        }
    }

    // تحقق 3: هل الرقم موجود بنفس المربع 3×3؟
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (grid[boxRowStart + r][boxColStart + c] === num) {
                return false;
            }
        }
    }

    // اجتاز كل الفحوصات = الرقم مسموح
    return true;
}

const sudokuGrid = createEmptyGrid();
console.log(sudokuGrid);

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const board = document.getElementById("board");

for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const randomNumber = Math.floor(Math.random() * 9);
    cell.textContent = romanNumerals[randomNumber];

    board.appendChild(cell);
}