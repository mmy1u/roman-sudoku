function vibrateError() {
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

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
    const streak = localStorage.getItem("romanSudokuStreak") || 0;
    document.getElementById("totalSolved").textContent = "🧩 ألغاز محلولة: " + totalSolved + " | 🔥 تتابع: " + streak + " يوم";

    const levels = ["easy", "medium", "hard", "expert"];
    const labels = { easy: "سهل", medium: "متوسط", hard: "صعب", expert: "خبير" };
    const elementIds = { easy: "bestEasy", medium: "bestMedium", hard: "bestHard", expert: "bestExpert" };

    levels.forEach(function(level) {
        const saved = localStorage.getItem("romanSudokuBestTime_" + level);
        const timeText = saved === null ? "--:--" : formatTime(parseInt(saved));
        document.getElementById(elementIds[level]).textContent = "🏆 " + labels[level] + ": " + timeText;
    });
}

const achievementsList = [
    { id: "first", label: "🥉 أول لغز", check: function(totalSolved) { return totalSolved >= 1; } },
    { id: "ten", label: "🥈 10 ألغاز", check: function(totalSolved) { return totalSolved >= 10; } },
    { id: "hundred", label: "🏅 100 لغز", check: function(totalSolved) { return totalSolved >= 100; } },
    { id: "expert", label: "👑 أول لغز خبير", check: function() { return localStorage.getItem("romanSudokuBestTime_expert") !== null; } }
];

function renderAchievements() {
    const totalSolved = parseInt(localStorage.getItem("romanSudokuTotalSolved")) || 0;
    const container = document.getElementById("achievementsList");
    container.innerHTML = "";

    achievementsList.forEach(function(achievement) {
        const unlocked = achievement.check(totalSolved);
        const div = document.createElement("div");
        div.classList.add("achievement");
        if (unlocked) {
            div.classList.add("unlocked");
        }
        div.textContent = (unlocked ? "✅ " : "🔒 ") + achievement.label;
        container.appendChild(div);
    });
}

function recordWin() {
    clearInterval(timerInterval);
    playWinSound();
    const totalSolved = parseInt(localStorage.getItem("romanSudokuTotalSolved")) || 0;
    localStorage.setItem("romanSudokuTotalSolved", totalSolved + 1);

    if (isDailyChallenge) {
        updateDailyStreak();
    }

    const isNewBest = saveBestTimeIfNeeded();
    document.getElementById("winMessage").textContent = isNewBest ? "🎉 مبروك! رقم قياسي جديد! 🏆" : "🎉 مبروك! حللت اللغز بنجاح!";
    document.getElementById("winMessage").style.display = "block";
}

function updateDailyStreak() {
    const today = getDailySeed();
    const lastPlayedDay = parseInt(localStorage.getItem("romanSudokuLastDailyWin")) || 0;
    const currentStreak = parseInt(localStorage.getItem("romanSudokuStreak")) || 0;

    if (lastPlayedDay === today) {
        return;
    }

    const yesterday = getPreviousDaySeed(today);

    if (lastPlayedDay === yesterday) {
        localStorage.setItem("romanSudokuStreak", currentStreak + 1);
    } else {
        localStorage.setItem("romanSudokuStreak", 1);
    }

    localStorage.setItem("romanSudokuLastDailyWin", today);
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
    isDailyChallenge = false;

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

function startDailyChallenge() {
    isDailyChallenge = true;

    const seed = getDailySeed();
    const rng = seededRandom(seed);

    sudokuGrid = createEmptyGrid();
    fillGrid(sudokuGrid);

    puzzleGrid = createPuzzle(sudokuGrid, 40, rng);
    originalPuzzleGrid = puzzleGrid.map(row => row.slice());

    selectedCell = null;
    errorCount = 0;
    moveHistory = [];
    updateErrorDisplay();

    document.getElementById("bestTime").textContent = "🏆 --:--";
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

function isValidUsername(username) {
    if (username.length < 4) {
        return "يجب أن يكون 4 أحرف على الأقل";
    }

    const allowedPattern = /^[a-z0-9._]+$/;
    if (!allowedPattern.test(username)) {
        return "يُسمح فقط بحروف إنجليزية صغيرة وأرقام ونقطة وشرطة سفلية";
    }

    if (username.startsWith(".")) {
        return "لا يمكن أن يبدأ الاسم بنقطة";
    }

    const isAllDots = username.split("").every(function(c) { return c === "."; });
    if (isAllDots) {
        return "لا يمكن أن يتكون الاسم من نقاط فقط";
    }

    const isAllSameChar = username.split("").every(function(c) { return c === username[0]; });
    if (isAllSameChar) {
        return "لا يمكن أن يتكون الاسم من حرف واحد مكرر";
    }

    return null;
}

const countries = [
    { code: "SA", name: "🇸🇦 السعودية" },
    { code: "AE", name: "🇦🇪 الإمارات" },
    { code: "EG", name: "🇪🇬 مصر" },
    { code: "JO", name: "🇯🇴 الأردن" },
    { code: "KW", name: "🇰🇼 الكويت" },
    { code: "QA", name: "🇶🇦 قطر" },
    { code: "BH", name: "🇧🇭 البحرين" },
    { code: "OM", name: "🇴🇲 عُمان" },
    { code: "IQ", name: "🇮🇶 العراق" },
    { code: "SY", name: "🇸🇾 سوريا" },
    { code: "LB", name: "🇱🇧 لبنان" },
    { code: "PS", name: "🇵🇸 فلسطين" },
    { code: "YE", name: "🇾🇪 اليمن" },
    { code: "MA", name: "🇲🇦 المغرب" },
    { code: "DZ", name: "🇩🇿 الجزائر" },
    { code: "TN", name: "🇹🇳 تونس" },
    { code: "LY", name: "🇱🇾 ليبيا" },
    { code: "SD", name: "🇸🇩 السودان" },
    { code: "US", name: "🇺🇸 الولايات المتحدة" },
    { code: "GB", name: "🇬🇧 بريطانيا" },
    { code: "FR", name: "🇫🇷 فرنسا" },
    { code: "DE", name: "🇩🇪 ألمانيا" },
    { code: "TR", name: "🇹🇷 تركيا" },
    { code: "IN", name: "🇮🇳 الهند" },
    { code: "PK", name: "🇵🇰 باكستان" },
    { code: "OTHER", name: "🌍 دولة أخرى" }
];

function populateCountrySelect() {
    const select = document.getElementById("countrySelect");
    select.innerHTML = "";
    countries.forEach(function(country) {
        const option = document.createElement("option");
        option.value = country.code;
        option.textContent = country.name;
        select.appendChild(option);
    });
}

function openProfile() {
    const user = window.firebaseCurrentUser();
    if (!user) return;

    window.firebaseGetPlayerProfile(user.uid).then(function(docSnap) {
        const data = docSnap.exists() ? docSnap.data() : {};

        document.getElementById("profileUsername").textContent = "👤 " + (data.username || "بدون اسم");

        if (data.createdAt) {
            const date = data.createdAt.toDate();
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            document.getElementById("profileJoinDate").textContent = "📅 عضو منذ: " + day + "/" + month + "/" + year;
        }

        document.getElementById("countrySelect").value = data.country || "SA";
        document.getElementById("bioInput").value = data.bio || "";
        document.getElementById("profileSaveMsg").textContent = "";
        document.getElementById("profileModal").style.display = "flex";
    });
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
let isDailyChallenge = false;

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
            vibrateError();
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
document.getElementById("dailyBtn").addEventListener("click", startDailyChallenge);

document.getElementById("statsBtn").addEventListener("click", function() {
    updateStatsDisplay();
    renderAchievements();
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

document.getElementById("themeBtn").addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    document.getElementById("themeBtn").textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("romanSudokuDarkTheme", isDark);
});

if (localStorage.getItem("romanSudokuDarkTheme") === "true") {
    document.body.classList.add("dark-theme");
    document.getElementById("themeBtn").textContent = "☀️";
}

document.getElementById("guestBtn").addEventListener("click", function() {
    window.firebaseSignInAnonymously()
        .then(function() {
            console.log("Guest login successful");
        })
        .catch(function(error) {
            console.error("Guest login error:", error);
            alert("حدث خطأ، حاول مرة أخرى");
        });
});

document.getElementById("googleLoginBtn").addEventListener("click", function() {
    window.firebaseSignInWithGoogle()
        .then(function() {
            console.log("Google login successful");
        })
        .catch(function(error) {
            console.error("Google login error:", error);
            alert("حدث خطأ بتسجيل الدخول، حاول مرة أخرى");
        });
});

document.getElementById("showSignupBtn").addEventListener("click", function() {
    document.getElementById("authButtons").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
});

document.getElementById("showLoginBtn").addEventListener("click", function() {
    document.getElementById("authButtons").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
});

document.getElementById("signupBackBtn").addEventListener("click", function() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("authButtons").style.display = "flex";
});

document.getElementById("loginBackBtn").addEventListener("click", function() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("authButtons").style.display = "flex";
});

document.getElementById("signupSubmitBtn").addEventListener("click", function() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const errorEl = document.getElementById("signupError");

    errorEl.textContent = "";

    window.firebaseSignUp(email, password)
        .then(function() {
            console.log("Account created");
        })
        .catch(function(error) {
            errorEl.textContent = translateFirebaseError(error.code);
        });
});

document.getElementById("loginSubmitBtn").addEventListener("click", function() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    window.firebaseSignIn(email, password)
        .then(function() {
            console.log("Login successful");
        })
        .catch(function(error) {
            errorEl.textContent = translateFirebaseError(error.code);
        });
});

function translateFirebaseError(code) {
    const messages = {
        "auth/email-already-in-use": "هذا البريد الإلكتروني مستخدم من قبل",
        "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة",
        "auth/weak-password": "كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل",
        "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        "auth/missing-password": "الرجاء إدخال كلمة المرور"
    };
    return messages[code] || "حدث خطأ، حاول مرة أخرى";
}

document.getElementById("logoutBtn").addEventListener("click", function() {
    const confirmed = confirm("متأكد تبي تسجل خروج؟");
    if (confirmed) {
        window.firebaseSignOut();
    }
});

document.getElementById("usernameSubmitBtn").addEventListener("click", function() {
    const input = document.getElementById("usernameInput");
    const errorEl = document.getElementById("usernameError");
    const username = input.value.trim().toLowerCase();

    errorEl.textContent = "";

    const validationError = isValidUsername(username);
    if (validationError) {
        errorEl.textContent = validationError;
        return;
    }

    window.firebaseCheckUsernameTaken(username).then(function(docSnap) {
        if (docSnap.exists()) {
            errorEl.textContent = "اسم المستخدم محجوز، جرّب اسمًا آخر";
            return;
        }

        const user = window.firebaseCurrentUser();
        window.firebaseSaveUsername(user.uid, username).then(function() {
            document.getElementById("usernameScreen").style.display = "none";
        }).catch(function(error) {
            errorEl.textContent = "حدث خطأ، حاول مرة أخرى";
            console.error(error);
        });
    });
});

document.getElementById("profileBtn").addEventListener("click", openProfile);

document.getElementById("closeProfileBtn").addEventListener("click", function() {
    document.getElementById("profileModal").style.display = "none";
});

document.getElementById("saveProfileBtn").addEventListener("click", function() {
    const user = window.firebaseCurrentUser();
    if (!user) return;

    const country = document.getElementById("countrySelect").value;
    const bio = document.getElementById("bioInput").value.trim();

    window.firebaseSaveProfile(user.uid, { country: country, bio: bio })
        .then(function() {
            document.getElementById("profileSaveMsg").textContent = "✅ تم الحفظ بنجاح";
        })
        .catch(function(error) {
            document.getElementById("profileSaveMsg").textContent = "حدث خطأ، حاول مرة أخرى";
            console.error(error);
        });
});

populateCountrySelect();

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