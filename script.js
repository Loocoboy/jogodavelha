let board = ['', '', '', '', '', '', '', '', ''];
let player = 'X';
let bot = 'O';
let gameOver = false;
let currentPlayer = player;
let firstBotMove = true;
let gameStarted = false;
let movesHistory = [];
let score = 0;
let gameReset = false;
let playerName = '';

const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset-btn');
const gameStatus = document.getElementById('game-status');
const scoreElement = document.getElementById('score');
const menuInicial = document.getElementById('menu-inicial');
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name');

function updateScore() {
    scoreElement.textContent = `Pontuação: ${score}`;
}

function initializeBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.textContent = cell;
        square.addEventListener('click', () => handlePlayerMove(index));
        boardElement.appendChild(square);
    });
}

function handlePlayerMove(index) {
    if (board[index] === '' && currentPlayer === player && !gameOver) {
        board[index] = player;
        movesHistory.push({ player: 'X', index });
        renderBoard();

        // Adiciona a animação ao quadrado onde o X foi colocado
        const square = document.querySelectorAll('.square')[index];
        square.classList.add('x-move'); // Aplica a animação definida no CSS
        
        // Remove a classe após a animação para não aplicar novamente
        setTimeout(() => {
            square.classList.remove('x-move');
        }, 500); // Tempo de duração da animação (500ms)

        if (!gameStarted) {
            showStatusMessage('Jogo iniciado', '#808080');
            gameStarted = true;
        }

        if (checkWinner(player)) {
            showStatusMessage('Você venceu!', '#4CAF50');
            gameOver = true;
            increaseScore();
            updateScore();
            return;
        }

        if (board.filter(cell => cell === '').length === 2) {
            removeOldMove();
        }

        currentPlayer = bot;
        setTimeout(() => botMove(), 300);
    }
}

function botMove() {
    if (firstBotMove) {
        let availableMoves = board
            .map((value, index) => value === '' ? index : -1)
            .filter(index => index !== -1);
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        board[randomMove] = bot;
        movesHistory.push({ player: 'O', index: randomMove });
        firstBotMove = false;
    } else {
        const bestMove = getBestMove();
        board[bestMove] = bot;
        movesHistory.push({ player: 'O', index: bestMove });
    }

    renderBoard();

    if (checkWinner(bot)) {
        showStatusMessage('Você perdeu!', '#F44336');
        gameOver = true;
        decreaseScore();
        updateScore();
        return;
    }

    if (board.filter(cell => cell === '').length === 2) {
        removeOldMove();
    }

    currentPlayer = player;
}

function removeOldMove() {
    if (movesHistory.length > 0) {
        const moveToRemove = movesHistory.shift();
        board[moveToRemove.index] = '';
        renderBoard();
    }
}

function renderBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
        square.textContent = board[index];

        // Verifique se o JavaScript está aplicando as cores corretamente
        console.log(`Index: ${index}, Valor: ${board[index]}`);

        if (board[index] === 'X') {
            square.style.color = '#4848e2'; 
            square.style.fontWeight = 'bold';
        } else if (board[index] === 'O') {
            square.style.color = '#da4646'; 
            square.style.fontWeight = 'bold';
        } else {
            square.style.color = 'black'; 
            square.style.fontWeight = 'normal';
        }
    });

    if (gameOver) {
        return;
    }
}

function checkWinner(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = bot;
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWinner(bot)) return 10 - depth;
    if (checkWinner(player)) return depth - 10;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = bot;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = player;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameOver = false;
    currentPlayer = player;
    firstBotMove = true;
    gameStarted = false;
    movesHistory = [];
    initializeBoard();
    clearStatusMessage();
    updateScore();
}

resetButton.addEventListener('click', resetGame);

function startGame() {
    playerName = playerNameInput.value.trim();
    if (playerName !== '') {
        menuInicial.style.display = 'none';
        gameContainer.style.display = 'block';
        resetGame();
    } else {
        alert('Por favor, insira seu nome!');
    }
}

// Decrementa a pontuação corretamente sem ficar negativa
function decreaseScore() {
    if (score > 0) {
        let decreaseValue = Math.floor(Math.random() * 10) + 1; // Número aleatório de 1 a 10
        if (score - decreaseValue < 0) {
            score = 0;
        } else {
            score -= decreaseValue;
        }
    }
}

// Aumenta a pontuação quando o jogador ganhar
function increaseScore() {
    let increaseValue = Math.floor(Math.random() * 5) + 1; // Número aleatório de 1 a 5
    score += increaseValue;
}

// Mostra mensagens de vitória, derrota ou início
function showStatusMessage(message, color) {
    gameStatus.textContent = message;
    gameStatus.style.visibility = 'visible';
    gameStatus.style.color = color; // Cor personalizada
}

// Limpa a mensagem de status
function clearStatusMessage() {
    gameStatus.textContent = '';
    gameStatus.style.visibility = 'hidden';
}

initializeBoard();
clearStatusMessage();
