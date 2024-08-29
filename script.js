const images = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStartTime;
let timerInterval;
let currentPlayer = 1;
let player1Pairs = 0;
let player2Pairs = 0;
let isTwoPlayerMode = false;

const menuElement = document.getElementById('menu');
const gameBoardElement = document.getElementById('game-board');
const gameBoardTwoElement = document.getElementById('game-board-two');
const gameAreaElement = document.getElementById('game-area');
const twoPlayerAreaElement = document.getElementById('two-player-area');
const gameStatsElement = document.getElementById('game-stats');
const timeElement = document.getElementById('time');
const movesElement = document.getElementById('moves');
const leaderboardElement = document.getElementById('leaderboard');
const player1PairsElement = document.getElementById('player1-pairs');
const player2PairsElement = document.getElementById('player2-pairs');
const currentPlayerElement = document.getElementById('current-player');

const playButton = document.getElementById('play-btn');
const playTwoButton = document.getElementById('play-two-btn');
const howToPlayButton = document.getElementById('how-to-play-btn');
const leaderboardButton = document.getElementById('leaderboard-btn');
const backToMenuButton = document.getElementById('back-to-menu-btn');
const backFromLeaderboardButton = document.getElementById('back-from-leaderboard');

playButton.addEventListener('click', () => startGame(false));
playTwoButton.addEventListener('click', () => startGame(true));
howToPlayButton.addEventListener('click', showHowToPlay);
leaderboardButton.addEventListener('click', showLeaderboard);
backToMenuButton.addEventListener('click', backToMenu);
backFromLeaderboardButton.addEventListener('click', backToMenu);

function startGame(twoPlayerMode) {
    isTwoPlayerMode = twoPlayerMode;
    menuElement.style.display = 'none';
    if (twoPlayerMode) {
        twoPlayerAreaElement.style.display = 'flex';
        resetTwoPlayerGame();
        createGameBoard(gameBoardTwoElement);
    } else {
        gameAreaElement.style.display = 'block';
        resetGame();
        createGameBoard(gameBoardElement);
        startTimer();
    }
}

function resetGame() {
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    updateMoves();
    gameBoardElement.innerHTML = '';
    clearInterval(timerInterval);
}

function resetTwoPlayerGame() {
    flippedCards = [];
    matchedPairs = 0;
    currentPlayer = 1;
    player1Pairs = 0;
    player2Pairs = 0;
    updatePlayerStats();
    gameBoardTwoElement.innerHTML = '';
}

function startTimer() {
    gameStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    timeElement.textContent = `${minutes}:${seconds}`;
}

function updateMoves() {
    movesElement.textContent = moves;
}

function updatePlayerStats() {
    player1PairsElement.textContent = player1Pairs;
    player2PairsElement.textContent = player2Pairs;
    currentPlayerElement.textContent = `Current Player: Player ${currentPlayer}`;
}

function showHowToPlay() {
    alert("How to play:\n\n1. Click on a card to flip it.\n2. Try to find matching pairs of cards.\n3. The game ends when all pairs are found.\n4. In two-player mode, players take turns. If a player finds a pair, they get another turn.");
}

function showLeaderboard() {
    menuElement.style.display = 'none';
    leaderboardElement.style.display = 'block';
    const timeLeaderboard = JSON.parse(localStorage.getItem('timeLeaderboard')) || [];
    const movesLeaderboard = JSON.parse(localStorage.getItem('movesLeaderboard')) || [];

    document.getElementById('time-leaderboard').innerHTML = timeLeaderboard
        .map((entry, index) => `<li>${entry.nickname} - ${entry.time}</li>`)
        .join('');

    document.getElementById('moves-leaderboard').innerHTML = movesLeaderboard
        .map((entry, index) => `<li>${entry.nickname} - ${entry.moves} moves</li>`)
        .join('');
}

function backToMenu() {
    menuElement.style.display = 'flex';
    gameAreaElement.style.display = 'none';
    twoPlayerAreaElement.style.display = 'none';
    leaderboardElement.style.display = 'none';
    resetGame();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createGameBoard(boardElement) {
    const shuffledImages = shuffleArray(images.slice(0, 8));
    const gameImages = [...shuffledImages, ...shuffledImages];
    shuffleArray(gameImages);

    gameImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.addEventListener('click', () => flipCard(card, boardElement));
        boardElement.appendChild(card);
    });
}

function flipCard(card, boardElement) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched-p1') && !card.classList.contains('matched-p2')) {
        card.classList.add('flipped');
        card.textContent = images[card.dataset.index % 8];
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            if (!isTwoPlayerMode) updateMoves();
            setTimeout(() => checkMatch(boardElement), 1000);
        }
    }
}

function checkMatch(boardElement) {
    const [card1, card2] = flippedCards;
    
    if (card1.textContent === card2.textContent) {
        matchedPairs++;
        if (isTwoPlayerMode) {
            const matchClass = currentPlayer === 1 ? 'matched-p1' : 'matched-p2';
            card1.classList.add(matchClass);
            card2.classList.add(matchClass);
            if (currentPlayer === 1) player1Pairs++;
            else player2Pairs++;
            updatePlayerStats();
        } else {
            card1.classList.add('matched');
            card2.classList.add('matched');
        }
        
        if (matchedPairs === 8) {
            endGame();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
        if (isTwoPlayerMode) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerStats();
        }
    }

    flippedCards = [];
}

function endGame() {
    if (!isTwoPlayerMode) {
        clearInterval(timerInterval);
        const finalTime = timeElement.textContent;
        const nickname = document.getElementById('nickname').value.trim();
        
        alert(`Congratulations, ${nickname}! You won!\nTime: ${finalTime}\nMoves: ${moves}`);
        
        updateLeaderboard(nickname, finalTime, moves);
    } else {
        const winner = player1Pairs > player2Pairs ? 'Player 1' : (player2Pairs > player1Pairs ? 'Player 2' : 'It\'s a tie');
        alert(`Game Over!\n${winner} wins!\nPlayer 1 Pairs: ${player1Pairs}\nPlayer 2 Pairs: ${player2Pairs}`);
    }
    
    backToMenu();
}

function updateLeaderboard(nickname, time, moves) {
    const timeLeaderboard = JSON.parse(localStorage.getItem('timeLeaderboard')) || [];
    const movesLeaderboard = JSON.parse(localStorage.getItem('movesLeaderboard')) || [];

    timeLeaderboard.push({ nickname, time });
    movesLeaderboard.push({ nickname, moves });

    timeLeaderboard.sort((a, b) => {
        const [aMin, aSec] = a.time.split(':').map(Number);
        const [bMin, bSec] = b.time.split(':').map(Number);
        return (aMin * 60 + aSec) - (bMin * 60 + bSec);
    });

    movesLeaderboard.sort((a, b) => a.moves - b.moves);

    timeLeaderboard.splice(10); // Keep only top 10
    movesLeaderboard.splice(10); // Keep only top 10

    localStorage.setItem('timeLeaderboard', JSON.stringify(timeLeaderboard));
    localStorage.setItem('movesLeaderboard', JSON.stringify(movesLeaderboard));
}

// Add any additional functions or event listeners here if needed

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // You might want to add any initialization code here
    // For example, you could show the menu when the page loads:
    menuElement.style.display = 'flex';
});