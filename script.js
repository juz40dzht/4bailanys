let todayData = null;
let selectedWords = [];
let correctGroups = 0;
let guessHistory = [];
let resultsEmoji = [];
let startTime = null;
let timerInterval = null;

async function loadGame() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        todayData = data.find(d => d.date === today) || data[0];

        document.getElementById('date-display').innerText = `Күн: ${todayData.date}`;
        renderBoard();
        startTimer();
    } catch (error) {
        console.error("Деректерді жүктеу қатесі:", error);
    }
}

function renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Сөздерді араластыру
    const allWords = todayData.categories.flatMap(c => 
        c.words.map(w => ({ text: w, level: c.level }))
    ).sort(() => Math.random() - 0.5);

    allWords.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word-card';
        div.innerText = word.text;
        div.onclick = () => toggleSelect(div, word);
        board.appendChild(div);
    });
}

function toggleSelect(div, word) {
    if (div.classList.contains('selected')) {
        div.classList.remove('selected');
        selectedWords = selectedWords.filter(w => w.text !== word.text);
    } else if (selectedWords.length < 4) {
        div.classList.add('selected');
        selectedWords.push(word);
    }
}

function checkGuess() {
    if (selectedWords.length !== 4) {
        showToast("4 сөз таңдаңыз!");
        return;
    }

    const currentGuess = selectedWords.map(w => w.text).sort().join(',');
    if (guessHistory.includes(currentGuess)) {
        showToast("Бұл жауап тексерілген!");
        return;
    }
    guessHistory.push(currentGuess);

    const levels = selectedWords.map(w => w.level);
    const emojis = { 1: '🟨', 2: '🟩', 3: '🟦', 4: '🟪' };
    resultsEmoji.push(levels.map(l => emojis[l]).join(''));

    const allSame = levels.every(l => l === levels[0]);

    if (allSame) {
        const category = todayData.categories.find(c => c.level === levels[0]);
        showToast(category.title);
        
        const board = document.getElementById('game-board');
        const solvedRow = document.createElement('div');
        solvedRow.className = `correct-row level-${levels[0]}`;
        solvedRow.innerHTML = `<strong>${category.title}</strong><span style="font-size:12px; margin-top:5px;">${category.words.join(', ')}</span>`;
        
        document.querySelectorAll('.selected').forEach(el => el.remove());
        board.prepend(solvedRow);
        
        selectedWords = [];
        correctGroups++;

        if (correctGroups === 4) {
            finishGame();
        }
    } else {
        const counts = {};
        levels.forEach(l => counts[l] = (counts[l] || 0) + 1);
        if (Object.values(counts).includes(3)) {
            showToast("Бір ғана сөз қате!");
        } else {
            showToast("Байланыс жоқ...");
        }
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        selectedWords = [];
    }
}

function finishGame() {
    clearInterval(timerInterval);
    document.getElementById('game-stats').style.display = 'block';
    
    setTimeout(() => {
        showToast("Керемет! Барлығын таптыңыз!");
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = `
            <div style="background-color: #f8f9fa; border: 2px solid #333; border-radius: 10px; padding: 20px; margin-top: 20px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #28a745;">Құттықтаймыз! 🎉</h3>
                <p style="margin: 0; font-weight: bold;">Ойын аяқталды.</p>
                <p style="margin: 5px 0 0 0; color: #555;">Келесі ойын түнгі 00:00-де жаңарады.</p>
            </div>
        `;
    }, 1000);
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        const mins = String(Math.floor(diff / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        document.getElementById('timer-display').innerText = `Уақыт: ${mins}:${secs}`;
    }, 1000);
}

function shareResult() {
    const time = document.getElementById('timer-display').innerText;
    const text = `Connections game 🌍\nДүниежүзі тарихы\nКүн: ${todayData.date}\n${time}\n\n${resultsEmoji.join('\n')}\n\nОйнау: ${window.location.href}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast("Нәтиже көшірілді!");
    });
}

function shuffleBoard() {
    if (correctGroups < 4) {
        renderBoard();
        selectedWords = [];
    }
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

loadGame();
