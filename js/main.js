function hasFinalAnswer(cell) {
    return cell.children.length === 0 && cell.textContent !== "";
}

function checkWin() {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const correctNumeral = romanNumerals[sudokuGrid[row][col] - 1];
        if (!hasFinalAnswer(cell) || cell.textContent !== correctNumeral) {
            return false;
        }
    }
    return true;
}

function toggleNote(cell, numeral) {
    if (hasFinalAnswer(cell)) return;

    let notesGrid = cell.querySelector(".notes-grid");
    if (notesGrid === null) {
        notesGrid = document.createElement("div");
        notesGrid.classList.add("notes-grid");
        romanNumerals.forEach(function(n) {
            const noteSpan = document.createElement("div");
            noteSpan.classList.add("note-num");
            noteSpan.dataset.numeral = n;
            notesGrid.appendChild(noteSpan);
        });
        cell.textContent = "";
        cell.appendChild(notesGrid);
    }

    const noteSpan = notesGrid.querySelector('[data-numeral="' + numeral + '"]');
    noteSpan.textContent = noteSpan.textContent === "" ? numeral : "";

    const anyNoteFilled = Array.from(notesGrid.children).some(function(el) {
        return el.textContent !== "";
    });
    if (!anyNoteFilled) {
        cell.innerHTML = "";
    }
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
                playClickSound();

                document.querySelectorAll(".cell").forEach(function(c) {
                    c.classList.remove("selected", "highlighted", "related");
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

                if (hasFinalAnswer(cell)) {
                    document.querySelectorAll(".cell").forEach(function(c) {
                        if (hasFinalAnswer(c) && c.textContent === cell.textContent && c !== cell) {
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
    document.querySelectorAll(".cell").forEach(function(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (col % 3 === 0 && col !== 0) cell.style.borderLeft = "3px solid #3D2645";
        if (row % 3 === 0 && row !== 0) cell.style.borderTop = "3px solid #3D2645";
    });
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    const m = minutes < 10 ? "0" + minutes : minutes;
    const s = seconds < 10 ? "0" + seconds : seconds;
    document.getElementById("timer").textContent = "⏱️ " + m + ":" + s;
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const m = minutes < 10 ? "0" + minutes : minutes;
    const s = seconds < 10 ? "0" + seconds : seconds;
    return m + ":" + s;
}

function getBestTimeKey() {
    return "romanSudokuBestTime_" + currentDifficulty;
}

function updateBestTimeDisplay() {
    const saved = localStorage.getItem(getBestTimeKey());
    document.getElementById("bestTime").textContent = "🏆 " + (saved === null ? "--:--" : formatTime(parseInt(saved)));
}

function saveBestTimeIfNeeded() {
    const saved = localStorage.getItem(getBestTimeKey());
    if (saved === null || secondsElapsed < parseInt(saved)) {
        localStorage.setItem(getBestTimeKey(), secondsElapsed);
        updateBestTimeDisplay();
        return true;
    }
    return false;
}

function updateStatsDisplay() {
    const totalSolved = localStorage.getItem("romanSudokuTotalSolved") || 0;
    document.getElementById("totalSolved").textContent = "🧩 ألغاز محلولة: " + totalSolved;

    const levels = ["easy", "medium", "hard", "expert"];
    const labels = { easy: "سهل", medium: "متوسط", hard: "صعب", expert: "خبير" };
    const elementIds = { easy: "bestEasy", medium: "bestMedium", hard: "bestHard", expert: "bestExpert" };

    levels.forEach(function(level) {
        const saved = localStorage.getItem("romanSudokuBestTime_" + level);
        const timeText = saved === null ? "--:--" : formatTime(parseInt(saved));
        document.getElementById(elementIds[level]).textContent = "🏆 " + labels[level] + ": " + timeText;
    });
}

function recordWin() {
    clearInterval(timerInterval);
    playWinSound();
    const totalSolved = parseInt(localStorage.getItem("romanSudokuTotalSolved")) || 0;
    localStorage.setItem("romanSudokuTotalSolved", totalSolved + 1);
    const isNewBest = saveBestTimeIfNeeded();
    document.getElementById("winMessage").textContent = isNewBest ? "🎉 مبروك! رقم قياسي جديد! 🏆" : "🎉 مبروك! حللت اللغز بنجاح!";
    document.getElementById("winMessage").style.display = "block";
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

function updateNumberPadState() {
    document.querySelectorAll(".num-btn").forEach(function(btn) {
        const numeral = btn.textContent;
        let count = 0;
        document.querySelectorAll(".cell").forEach(function(cell) {
            if (hasFinalAnswer(cell) && cell.textContent === numeral && !cell.classList.contains("error")) {
                count++;
            }
        });
        btn.classList.toggle("completed", count >= 9);
    });
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
    updateBestTimeDisplay();

    document.getElementById("winMessage").style.display = "none";

    renderBoard();
    applyBoxBorders();
    startTimer();
    updateNumberPadState();
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
    updateNumberPadState();
}

function undoMove() {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory.pop();
    lastMove.cell.textContent = lastMove.previousValue;
    lastMove.cell.classList.remove("error");
    updateNumberPadState();
}

function checkBoard() {
    document.querySelectorAll(".editable").forEach(function(cell) {
        if (!hasFinalAnswer(cell)) return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const correctNumeral = romanNumerals[sudokuGrid[row][col] - 1];
        cell.classList.toggle("error", cell.textContent !== correctNumeral);
    });
    updateNumberPadState();
}

function giveHint() {
    if (selectedCell === null) return;

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    const correctNumeral = romanNumerals[sudokuGrid[row][col] - 1];

    moveHistory.push({ cell: selectedCell, previousValue: selectedCell.textContent });

    selectedCell.textContent = correctNumeral;
    selectedCell.classList.remove("error");

    updateNumberPadState();

    if (checkWin()) {
        recordWin();
    }
}

function revealSolution() {
    const confirmed = confirm("متأكد؟ هذا يعرض الحل الكامل ويوقف المحاولة الحالية.");

    if (!confirmed) {
        return;
    }

    clearInterval(timerInterval);

    document.querySelectorAll(".editable").forEach(function(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.textContent = romanNumerals[sudokuGrid[row][col] - 1];
        cell.classList.remove("error");
    });

    updateNumberPadState();
}

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const board = document.getElementById("board");
const numberPad = document.getElementById("numberPad");

const difficultyLevels = { easy: 30, medium: 40, hard: 50, expert: 58 };

let currentDifficulty = "medium";
let sudokuGrid;
let puzzleGrid;
let originalPuzzleGrid;
let selectedCell = null;
let secondsElapsed = 0;
let timerInterval;
let errorCount = 0;
let moveHistory = [];
let notesMode = false;

romanNumerals.forEach(function(numeral) {
    const btn = document.createElement("div");
    btn.classList.add("num-btn");
    btn.textContent = numeral;

    btn.addEventListener("click", function() {
        if (selectedCell === null) return;

        if (notesMode) {
            toggleNote(selectedCell, numeral);
            playClickSound();
            return;
        }

        moveHistory.push({ cell: selectedCell, previousValue: selectedCell.textContent });

        selectedCell.textContent = numeral;

        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        const correctNumber = sudokuGrid[row][col];

        if (numeral === romanNumerals[correctNumber - 1]) {
            selectedCell.classList.remove("error");
            playCorrectSound();
        } else {
            selectedCell.classList.add("error");
            playErrorSound();
            errorCount++;
            updateErrorDisplay();
        }

        updateNumberPadState();

        if (checkWin()) {
            recordWin();
        }
    });

    numberPad.appendChild(btn);
});

document.getElementById("newGameBtn").addEventListener("click", startNewGame);
document.getElementById("restartBtn").addEventListener("click", restartPuzzle);
document.getElementById("undoBtn").addEventListener("click", undoMove);
document.getElementById("checkBtn").addEventListener("click", checkBoard);
document.getElementById("hintBtn").addEventListener("click", giveHint);
document.getElementById("solveBtn").addEventListener("click", revealSolution);

document.getElementById("statsBtn").addEventListener("click", function() {
    updateStatsDisplay();
    document.getElementById("statsModal").style.display = "flex";
});

document.getElementById("closeStatsBtn").addEventListener("click", function() {
    document.getElementById("statsModal").style.display = "none";
});

document.getElementById("soundBtn").addEventListener("click", function() {
    soundEnabled = !soundEnabled;
    document.getElementById("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";
});

document.getElementById("notesBtn").addEventListener("click", function() {
    notesMode = !notesMode;
    document.getElementById("notesBtn").classList.toggle("active", notesMode);
});

const difficultyButtons = document.querySelectorAll(".diff-btn");
difficultyButtons.forEach(function(btn) {
    if (btn.dataset.level === currentDifficulty) {
        btn.classList.add("active");
    }
    btn.addEventListener("click", function() {
        difficultyButtons.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentDifficulty = btn.dataset.level;
        startNewGame();
    });
});

startNewGame();