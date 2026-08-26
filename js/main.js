const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const board = document.getElementById("board");

for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
}