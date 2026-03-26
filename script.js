let selectedWords = [];
let correctGroups = 0;
let todayData = null;

async function loadGame() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Бүгінгі датаны алу
        const today = new Date().toISOString().split('T')[0];
        todayData = data.find(item => item.date === today) || data[0];
        
        document.getElementById('date-display').innerText = `Күн: ${todayData.date}`;
        renderBoard();
    } catch (e) {
        console.error("Жүктеу қатесі:", e);
    }
}

function renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    let allWords = [];
    todayData.categories.forEach(cat => {
        cat.words.forEach(word => allWords.push({ text: word, level: cat.level }));
    });
    
    allWords.sort(() => Math.random() - 0.5);

    allWords.forEach(wordObj => {
        const btn = document.createElement('div');
        btn.classList.add('word-card');
        btn.innerText = wordObj.text;
        btn.addEventListener('click', () => selectWord(btn, wordObj));
        board.appendChild(btn);
    });
}

function selectWord(el, obj) {
    if (el.classList.contains('correct')) return;
    
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        selectedWords = selectedWords.filter(w => w.text !== obj.text);
    } else if (selectedWords.length < 4) {
        el.classList.add('selected');
        selectedWords.push(obj);
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.innerHTML = ''; 
    container.appendChild(toast);
}

function checkGuess() {
    if (selectedWords.length !== 4) {
        showToast("4 сөз таңдаңыз!");
        return;
    }

    const levels = selectedWords.map(w => w.level);
    const allSame = levels.every(l => l === levels[0]);

    if (allSame) {
        const category = todayData.categories.find(c => c.level === levels[0]);
        
        showToast(category.title);

        const board = document.getElementById('game-board');
        const solvedRow = document.createElement('div');
        solvedRow.className = `correct-row level-${levels[0]}`;
        solvedRow.innerHTML = `<strong>${category.title}</strong><span style="font-size:12px; margin-top:5px;">${category.words.join(', ')}</span>`;
        
        // Таңдалғандарды өшіріп, жолақты басына қосу
        document.querySelectorAll('.selected').forEach(el => el.remove());
        board.prepend(solvedRow);
        
        selectedWords = [];
        correctGroups++;
        
        if (correctGroups === 4) {
            setTimeout(() => showToast("Керемет! Барлығын таптыңыз!"), 1000);
        }
    } else {
        showToast("Байланыс жоқ...");
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        selectedWords = [];
    }
}

function shuffleBoard() {
    if (correctGroups < 4) {
        selectedWords = [];
        renderBoard();
    }
}

loadGame();
