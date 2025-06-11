// Game state
let gameState = {
    playerCards: [],
    computerCards: [],
    playerScore: 0,
    computerScore: 0,
    currentRound: 1,
    currentPhase: 1,
    playerPhase1Card: null,
    computerPhase1Card: null,
    playerPhase2Card: null,
    computerPhase2Card: null,
    usedPlayerCards: [],
    usedComputerCards: []
};

// DOM elements
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const currentRoundEl = document.getElementById('current-round');
const currentPhaseEl = document.getElementById('current-phase');
const playerHandEl = document.getElementById('player-hand');
const messageEl = document.getElementById('message');
const nextBtn = document.getElementById('next-btn');
const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const gameEndModal = document.getElementById('game-end-modal');
const gameEndTitle = document.getElementById('game-end-title');
const gameEndMessage = document.getElementById('game-end-message');
const playAgainBtn = document.getElementById('play-again-btn');
const closeBtn = document.querySelector('.close');

// Card elements
const playerPhase1CardEl = document.getElementById('player-phase1-card');
const playerPhase2CardEl = document.getElementById('player-phase2-card');
const computerPhase1CardEl = document.getElementById('computer-phase1-card');
const computerPhase2CardEl = document.getElementById('computer-phase2-card');

// Initialize the game
function initGame() {
    // Reset game state
    gameState = {
        playerCards: [],
        computerCards: [],
        playerScore: 0,
        computerScore: 0,
        currentRound: 1,
        currentPhase: 1,
        playerPhase1Card: null,
        computerPhase1Card: null,
        playerPhase2Card: null,
        computerPhase2Card: null,
        usedPlayerCards: [],
        usedComputerCards: []
    };

    // Create two sets of 1-9 cards for each player
    for (let i = 0; i < 2; i++) {
        for (let j = 1; j <= 9; j++) {
            gameState.playerCards.push(j);
            gameState.computerCards.push(j);
        }
    }

    // Shuffle the cards
    shuffleArray(gameState.playerCards);
    shuffleArray(gameState.computerCards);

    // Update UI
    updateUI();
    renderPlayerHand();
    messageEl.textContent = "Select a card to play (Phase 1)";
    nextBtn.classList.add('hidden');
}

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render player's hand
function renderPlayerHand() {
    playerHandEl.innerHTML = '';
    const availableCards = getAvailablePlayerCards();
    
    availableCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = card;
        cardEl.addEventListener('click', () => playCard(card));
        playerHandEl.appendChild(cardEl);
    });
}

// Get available player cards
function getAvailablePlayerCards() {
    const allCards = [...gameState.playerCards];
    const usedCards = [...gameState.usedPlayerCards];
    
    // Create a frequency map of used cards
    const usedCount = {};
    usedCards.forEach(card => {
        usedCount[card] = (usedCount[card] || 0) + 1;
    });
    
    // Create a frequency map of all cards
    const allCount = {};
    allCards.forEach(card => {
        allCount[card] = (allCount[card] || 0) + 1;
    });
    
    // Calculate available cards
    const availableCards = [];
    for (let card in allCount) {
        const available = allCount[card] - (usedCount[card] || 0);
        for (let i = 0; i < available; i++) {
            availableCards.push(parseInt(card));
        }
    }
    
    return availableCards;
}

// Play a card
function playCard(card) {
    if (gameState.currentPhase === 1) {
        gameState.playerPhase1Card = card;
        gameState.usedPlayerCards.push(card);
        
        // Computer plays phase 1 card
        const computerCard = computerPlayPhase1();
        gameState.computerPhase1Card = computerCard;
        gameState.usedComputerCards.push(computerCard);
        
        // Reveal phase 1 cards
        revealPhase1Cards();
        
        // Update UI
        updateUI();
        messageEl.textContent = `Phase 1: You played ${card}, Computer played ${computerCard}`;
        nextBtn.classList.remove('hidden');
    } else if (gameState.currentPhase === 2) {
        gameState.playerPhase2Card = card;
        gameState.usedPlayerCards.push(card);
        
        // Computer plays phase 2 card
        const computerCard = computerPlayPhase2();
        gameState.computerPhase2Card = computerCard;
        gameState.usedComputerCards.push(computerCard);
        
        // Reveal phase 2 cards and determine round winner
        revealPhase2Cards();
        
        // Update UI
        updateUI();
        
        const playerSum = gameState.playerPhase1Card + gameState.playerPhase2Card;
        const computerSum = gameState.computerPhase1Card + gameState.computerPhase2Card;
        
        if (playerSum > computerSum) {
            gameState.playerScore++;
            messageEl.textContent = `You won the round! (${playerSum} vs ${computerSum})`;
        } else if (computerSum > playerSum) {
            gameState.computerScore++;
            messageEl.textContent = `Computer won the round! (${computerSum} vs ${playerSum})`;
        } else {
            messageEl.textContent = `Round tied! (${playerSum} vs ${computerSum})`;
        }
        
        // Check if game is over
        if (gameState.playerScore >= 5 || gameState.computerScore >= 5 || gameState.currentRound >= 9) {
            endGame();
        } else {
            nextBtn.textContent = "Next Round";
            nextBtn.classList.remove('hidden');
        }
    }
}

// Computer AI for phase 1
function computerPlayPhase1() {
    const availableCards = getAvailableComputerCards();
    
    // Simple strategy: play a medium card in phase 1
    // Sort available cards and pick one around the middle
    availableCards.sort((a, b) => a - b);
    const middleIndex = Math.floor(availableCards.length / 2);
    return availableCards[middleIndex];
}

// Computer AI for phase 2
function computerPlayPhase2() {
    const availableCards = getAvailableComputerCards();
    
    // Get current sums
    const playerPhase1 = gameState.playerPhase1Card;
    const computerPhase1 = gameState.computerPhase1Card;
    const currentDiff = playerPhase1 - computerPhase1;
    
    // Strategy:
    // If computer is ahead after phase 1, play conservatively (lower card)
    // If computer is behind after phase 1, play aggressively (higher card)
    // If tied, play a medium card
    
    availableCards.sort((a, b) => a - b);
    
    if (currentDiff < 0) { // Computer is ahead
        // Play a lower card (first half of sorted available cards)
        const playIndex = Math.floor(Math.random() * Math.floor(availableCards.length / 2));
        return availableCards[playIndex];
    } else if (currentDiff > 0) { // Computer is behind
        // Play a higher card (second half of sorted available cards)
        const playIndex = Math.floor(availableCards.length / 2 + Math.random() * Math.ceil(availableCards.length / 2));
        return availableCards[Math.min(playIndex, availableCards.length - 1)];
    } else { // Tied
        // Play a medium card
        const middleIndex = Math.floor(availableCards.length / 2);
        return availableCards[middleIndex];
    }
}

// Get available computer cards
function getAvailableComputerCards() {
    const allCards = [...gameState.computerCards];
    const usedCards = [...gameState.usedComputerCards];
    
    // Create a frequency map of used cards
    const usedCount = {};
    usedCards.forEach(card => {
        usedCount[card] = (usedCount[card] || 0) + 1;
    });
    
    // Create a frequency map of all cards
    const allCount = {};
    allCards.forEach(card => {
        allCount[card] = (allCount[card] || 0) + 1;
    });
    
    // Calculate available cards
    const availableCards = [];
    for (let card in allCount) {
        const available = allCount[card] - (usedCount[card] || 0);
        for (let i = 0; i < available; i++) {
            availableCards.push(parseInt(card));
        }
    }
    
    return availableCards;
}

// Reveal phase 1 cards
function revealPhase1Cards() {
    playerPhase1CardEl.textContent = gameState.playerPhase1Card;
    playerPhase1CardEl.classList.remove('hidden');
    
    computerPhase1CardEl.textContent = gameState.computerPhase1Card;
    computerPhase1CardEl.classList.remove('hidden');
}

// Reveal phase 2 cards
function revealPhase2Cards() {
    playerPhase2CardEl.textContent = gameState.playerPhase2Card;
    playerPhase2CardEl.classList.remove('hidden');
    
    computerPhase2CardEl.textContent = gameState.computerPhase2Card;
    computerPhase2CardEl.classList.remove('hidden');
}

// Update UI
function updateUI() {
    playerScoreEl.textContent = gameState.playerScore;
    computerScoreEl.textContent = gameState.computerScore;
    currentRoundEl.textContent = gameState.currentRound;
    currentPhaseEl.textContent = gameState.currentPhase;
}

// Next button handler
function handleNext() {
    if (gameState.currentPhase === 1) {
        gameState.currentPhase = 2;
        updateUI();
        renderPlayerHand();
        messageEl.textContent = "Select a card to play (Phase 2)";
        nextBtn.classList.add('hidden');
    } else if (gameState.currentPhase === 2) {
        // Move to next round
        gameState.currentRound++;
        gameState.currentPhase = 1;
        gameState.playerPhase1Card = null;
        gameState.computerPhase1Card = null;
        gameState.playerPhase2Card = null;
        gameState.computerPhase2Card = null;
        
        // Reset card displays
        playerPhase1CardEl.textContent = '?';
        playerPhase1CardEl.classList.add('hidden');
        playerPhase2CardEl.textContent = '?';
        playerPhase2CardEl.classList.add('hidden');
        computerPhase1CardEl.textContent = '?';
        computerPhase1CardEl.classList.add('hidden');
        computerPhase2CardEl.textContent = '?';
        computerPhase2CardEl.classList.add('hidden');
        
        updateUI();
        renderPlayerHand();
        messageEl.textContent = "Select a card to play (Phase 1)";
        nextBtn.classList.add('hidden');
    }
}

// End game
function endGame() {
    if (gameState.playerScore > gameState.computerScore) {
        gameEndTitle.textContent = "You Win!";
        gameEndMessage.textContent = `Congratulations! You won the game ${gameState.playerScore}-${gameState.computerScore}`;
    } else if (gameState.computerScore > gameState.playerScore) {
        gameEndTitle.textContent = "Computer Wins!";
        gameEndMessage.textContent = `The computer won the game ${gameState.computerScore}-${gameState.playerScore}. Better luck next time!`;
    } else {
        gameEndTitle.textContent = "Game Tied!";
        gameEndMessage.textContent = `The game ended in a tie ${gameState.playerScore}-${gameState.computerScore}`;
    }
    
    gameEndModal.style.display = "block";
}

// Event listeners
nextBtn.addEventListener('click', handleNext);
rulesBtn.addEventListener('click', () => {
    rulesModal.style.display = "block";
});
closeBtn.addEventListener('click', () => {
    rulesModal.style.display = "none";
});
playAgainBtn.addEventListener('click', () => {
    gameEndModal.style.display = "none";
    initGame();
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === rulesModal) {
        rulesModal.style.display = "none";
    }
    if (event.target === gameEndModal) {
        gameEndModal.style.display = "none";
    }
});

// PWA setup
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Initialize the game
initGame();
