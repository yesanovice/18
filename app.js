class Game {
  constructor() {
    this.playerCards = [];
    this.computerCards = [];
    this.playerScore = 0;
    this.computerScore = 0;
    this.round = 1;
    this.phase = 1;
    this.selectedCard = null;
    this.playerPhase1Card = null;
    this.playerPhase2Card = null;
    this.computerPhase1Card = null;
    this.computerPhase2Card = null;
    this.ai = new EnhancedAIPlayer();
    this.soundEnabled = true;
    this.gameCompleted = false;
    
    this.initElements();
    this.initEventListeners();
    this.newGame();
  }
  
  initElements() {
    this.playerCardsElement = document.getElementById('player-cards');
    this.playerScoreElement = document.getElementById('player-score');
    this.computerScoreElement = document.getElementById('computer-score');
    this.roundNumberElement = document.getElementById('round-number');
    this.playButton = document.getElementById('play-btn');
    this.nextRoundButton = document.getElementById('next-round-btn');
    this.newGameButton = document.getElementById('new-game-btn');
    this.resultModal = document.getElementById('result-modal');
    this.resultTitle = document.getElementById('result-title');
    this.resultMessage = document.getElementById('result-message');
    this.modalCloseButton = document.getElementById('modal-close-btn');
    this.playerPhase1Element = document.getElementById('player-phase1');
    this.playerPhase2Element = document.getElementById('player-phase2');
    this.computerPhase1Element = document.getElementById('computer-phase1-revealed');
    this.computerPhase2Element = document.getElementById('computer-phase2-revealed');
    this.computerHiddenPhase1 = document.getElementById('computer-phase1');
    this.computerHiddenPhase2 = document.getElementById('computer-phase2');
    this.playerSumElement = document.getElementById('player-sum');
    this.computerSumElement = document.getElementById('computer-sum');
    this.rulesModal = document.getElementById('rules-modal');
    this.rulesButton = document.getElementById('rules-btn');
    this.rulesCloseButton = document.getElementById('rules-close-btn');
    this.soundButton = document.getElementById('sound-btn');
    this.cardPlaySound = document.getElementById('card-play-sound');
    this.winSound = document.getElementById('win-sound');
    this.loseSound = document.getElementById('lose-sound');
    this.tieSound = document.getElementById('tie-sound');
  }
  
  initEventListeners() {
    this.playButton.addEventListener('click', () => this.playCard());
    this.nextRoundButton.addEventListener('click', () => this.nextRound());
    this.newGameButton.addEventListener('click', () => this.newGame());
    this.modalCloseButton.addEventListener('click', () => this.closeModal());
    this.rulesButton.addEventListener('click', () => this.showRules());
    this.rulesCloseButton.addEventListener('click', () => this.closeRules());
    this.soundButton.addEventListener('click', () => this.toggleSound());
    
    this.playerCardsElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('card') && !e.target.classList.contains('empty')) {
        this.selectCard(parseInt(e.target.dataset.value));
      }
    });
  }
  
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundButton.innerHTML = this.soundEnabled ? 
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>` :
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>`;
    
    this.soundButton.setAttribute('title', this.soundEnabled ? 'Sound On' : 'Sound Off');
  }
  
  playSound(sound) {
    if (!this.soundEnabled) return;
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
  }
  
  showRules() {
    this.rulesModal.style.display = 'flex';
  }
  
  closeRules() {
    this.rulesModal.style.display = 'none';
  }
  
  newGame() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.round = 1;
    this.phase = 1;
    this.gameCompleted = false;
    this.updateScoreboard();
    this.closeModal();
    this.resetRound();
    this.dealCards();
  }
  
  dealCards() {
    this.playerCards = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
    this.computerCards = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
    this.ai = new EnhancedAIPlayer();
    this.renderPlayerCards();
    this.resetPlayArea();
    this.updateControls();
  }
  
  renderPlayerCards() {
    this.playerCardsElement.innerHTML = '';
    const sortedCards = [...this.playerCards].sort((a, b) => a - b);
    
    sortedCards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.textContent = card;
      cardElement.dataset.value = card;
      this.playerCardsElement.appendChild(cardElement);
    });
  }
  
  selectCard(cardValue) {
    if (this.phase !== 1 && this.phase !== 2 || this.gameCompleted) return;
    
    // Remove selection from all cards
    const cards = document.querySelectorAll('.player-cards .card');
    cards.forEach(card => card.classList.remove('selected'));
    
    // Find and select the clicked card
    const selectedCardElement = Array.from(cards).find(
      card => parseInt(card.dataset.value) === cardValue
    );
    
    if (selectedCardElement) {
      selectedCardElement.classList.add('selected');
      this.selectedCard = cardValue;
      this.playButton.disabled = false;
    }
  }
  
  playCard() {
    if (this.selectedCard === null || this.gameCompleted) return;
    this.playSound(this.cardPlaySound);
    
    if (this.phase === 1) {
      this.playPhase1();
    } else if (this.phase === 2) {
      this.playPhase2();
    }
  }
  
  playPhase1() {
    this.playerPhase1Card = this.selectedCard;
    const cardIndex = this.playerCards.indexOf(this.selectedCard);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
    }
    
    this.computerPhase1Card = this.ai.playFirstCard();
    
    this.playerPhase1Element.textContent = this.playerPhase1Card;
    this.playerPhase1Element.className = 'card';
    this.playerPhase1Element.classList.add('card-play-animation');
    setTimeout(() => {
      this.playerPhase1Element.classList.remove('card-play-animation');
    }, 300);
    
    this.computerHiddenPhase1.textContent = '?';
    this.computerPhase1Element.textContent = this.computerPhase1Card;
    this.computerPhase1Element.className = 'card';
    this.computerPhase1Element.classList.add('card-play-animation');
    setTimeout(() => {
      this.computerPhase1Element.classList.remove('card-play-animation');
    }, 300);
    
    this.phase = 2;
    this.selectedCard = null;
    this.renderPlayerCards();
    this.updateControls();
  }
  
  playPhase2() {
    this.playerPhase2Card = this.selectedCard;
    const cardIndex = this.playerCards.indexOf(this.selectedCard);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
    }
    
    this.computerPhase2Card = this.ai.playSecondCard(this.playerPhase1Card, this.computerPhase1Card);
    
    this.playerPhase2Element.textContent = this.playerPhase2Card;
    this.playerPhase2Element.className = 'card';
    this.playerPhase2Element.classList.add('card-play-animation');
    setTimeout(() => {
      this.playerPhase2Element.classList.remove('card-play-animation');
    }, 300);
    
    this.computerHiddenPhase2.textContent = '?';
    this.computerPhase2Element.textContent = this.computerPhase2Card;
    this.computerPhase2Element.className = 'card';
    this.computerPhase2Element.classList.add('card-play-animation');
    setTimeout(() => {
      this.computerPhase2Element.classList.remove('card-play-animation');
    }, 300);
    
    this.ai.recordPlayedCards(this.playerPhase1Card, this.computerPhase1Card);
    this.ai.recordPlayedCards(this.playerPhase2Card, this.computerPhase2Card);
    
    const playerSum = this.playerPhase1Card + this.playerPhase2Card;
    const computerSum = this.computerPhase1Card + this.computerPhase2Card;
    
    this.playerSumElement.textContent = playerSum;
    this.computerSumElement.textContent = computerSum;
    
    let roundWinner = null;
    if (playerSum > computerSum) {
      roundWinner = 'player';
      this.playerScore++;
      this.playSound(this.winSound);
    } else if (computerSum > playerSum) {
      roundWinner = 'computer';
      this.computerScore++;
      this.playSound(this.loseSound);
    } else {
      roundWinner = 'tie';
      this.playSound(this.tieSound);
    }
    
    this.ai.updateScores(roundWinner === 'computer');
    this.showResult(roundWinner, playerSum, computerSum);
    
    this.phase = 3;
    this.selectedCard = null;
    this.updateControls();
  }
  
  showResult(winner, playerSum, computerSum) {
    this.resultModal.style.display = 'flex';

    if (winner === 'player') {
      this.resultTitle.textContent = 'You Won the Round!';
      this.resultTitle.className = 'win';
      this.resultMessage.textContent = `Your sum: ${playerSum} vs Computer sum: ${computerSum}`;
      this.resultMessage.className = 'win';
    } else if (winner === 'computer') {
      this.resultTitle.textContent = 'Computer Won the Round';
      this.resultTitle.className = 'lose';
      this.resultMessage.textContent = `Your sum: ${playerSum} vs Computer sum: ${computerSum}`;
      this.resultMessage.className = 'lose';
    } else {
      this.resultTitle.textContent = 'Round Tied';
      this.resultTitle.className = 'tie';
      this.resultMessage.textContent = `Both sums: ${playerSum}`;
      this.resultMessage.className = 'tie';
    }

    if (this.playerScore >= 5 || this.computerScore >= 5) {
      this.gameCompleted = true;
      this.showGameOver();
    }
  }
  
  showGameOver() {
    if (this.playerScore > this.computerScore) {
      this.resultTitle.textContent = 'You Won the Game! 🎉';
      this.resultMessage.textContent = `Final Score: You ${this.playerScore} - ${this.computerScore} Computer`;
      this.playSound(this.winSound);
    } else if (this.computerScore > this.playerScore) {
      this.resultTitle.textContent = 'Computer Won the Game';
      this.resultMessage.textContent = `Final Score: Computer ${this.computerScore} - ${this.playerScore} You`;
      this.playSound(this.loseSound);
    } else {
      this.resultTitle.textContent = 'Game Tied';
      this.resultMessage.textContent = `Final Score: ${this.playerScore}-${this.computerScore}`;
      this.playSound(this.tieSound);
    }
    
    this.modalCloseButton.textContent = 'New Game';
  }
  
  closeModal() {
    this.resultModal.style.display = 'none';
    if (this.gameCompleted) {
      this.newGame();
    }
  }
  
  nextRound() {
    this.round++;
    if (this.round <= 9) {
      this.resetRound();
      this.updateScoreboard();
      this.updateControls();
    } else {
      if (!this.gameCompleted) {
        this.gameCompleted = true;
        this.showGameOver();
      } else {
        this.newGame();
      }
    }
  }
  
  resetRound() {
    this.phase = 1;
    this.selectedCard = null;
    this.playerPhase1Card = null;
    this.playerPhase2Card = null;
    this.computerPhase1Card = null;
    this.computerPhase2Card = null;
    
    // Clear any selected card UI
    const cards = document.querySelectorAll('.player-cards .card');
    cards.forEach(card => card.classList.remove('selected'));
    
    this.resetPlayArea();
    this.renderPlayerCards();
  }
  
  resetPlayArea() {
    this.playerPhase1Element.textContent = '';
    this.playerPhase1Element.className = 'card empty';
    this.playerPhase2Element.textContent = '';
    this.playerPhase2Element.className = 'card empty';
    this.computerPhase1Element.textContent = '';
    this.computerPhase1Element.className = 'card empty';
    this.computerPhase2Element.textContent = '';
    this.computerPhase2Element.className = 'card empty';
    this.computerHiddenPhase1.textContent = '?';
    this.computerHiddenPhase1.className = 'card back';
    this.computerHiddenPhase2.textContent = '?';
    this.computerHiddenPhase2.className = 'card back';
    this.playerSumElement.textContent = '0';
    this.computerSumElement.textContent = '0';
  }
  
  updateScoreboard() {
    this.playerScoreElement.textContent = this.playerScore;
    this.computerScoreElement.textContent = this.computerScore;
    this.roundNumberElement.textContent = `${this.round}/9`;
  }
  
  updateControls() {
    // Enable play button only if:
    // - Game is not completed
    // - We're in phase 1 or 2
    // - A card is selected (for phases 1 and 2)
    this.playButton.disabled = this.gameCompleted || 
                             (this.phase !== 1 && this.phase !== 2) || 
                             this.selectedCard === null;
    
    // Enable next round button only if:
    // - We're in phase 3 (round completed)
    // - Game is not completed
    this.nextRoundButton.disabled = this.phase !== 3 || this.gameCompleted;
  }
}

class EnhancedAIPlayer {
  constructor() {
    this.remainingCards = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
    this.usedCards = [];
    this.opponentModel = {
      remaining: [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9],
      used: []
    };
    this.roundNumber = 0;
    this.aiScore = 0;
    this.playerScore = 0;
  }

  updateScores(aiWon) {
    if (aiWon) this.aiScore++;
    else this.playerScore++;
    this.roundNumber++;
  }

  recordPlayedCards(playerCard, aiCard) {
    this.opponentModel.used.push(playerCard);
    const index = this.opponentModel.remaining.indexOf(playerCard);
    if (index !== -1) {
      this.opponentModel.remaining.splice(index, 1);
    }
    
    const aiIndex = this.remainingCards.indexOf(aiCard);
    if (aiIndex !== -1) {
      this.remainingCards.splice(aiIndex, 1);
      this.usedCards.push(aiCard);
    }
  }

  playFirstCard() {
    const roundImportance = this.calculateRoundImportance();
    const remainingCards = [...this.remainingCards];
    
    if (this.roundNumber < 3) {
      const midCards = remainingCards.filter(c => c >= 3 && c <= 7);
      if (midCards.length > 0) {
        return this.playCard(this.selectRandomCard(midCards));
      }
    }
    
    if (roundImportance > 0.7) {
      const strongCards = remainingCards.filter(c => c >= 6);
      if (strongCards.length > 0) {
        return this.playCard(this.selectRandomCard(strongCards));
      }
    } else {
      const lowMidCards = remainingCards.filter(c => c <= 5);
      if (lowMidCards.length > 0) {
        return this.playCard(this.selectRandomCard(lowMidCards));
      }
    }
    
    return this.playCard(this.selectRandomCard(remainingCards));
  }

  playSecondCard(playerFirstCard, aiFirstCard) {
    this.recordPlayedCards(playerFirstCard, aiFirstCard);
    const currentSum = playerFirstCard + aiFirstCard;
    const remainingCards = [...this.remainingCards];
    const roundImportance = this.calculateRoundImportance();
    
    const opponentCards = this.opponentModel.remaining;
    const opponentAvg = opponentCards.reduce((a, b) => a + b, 0) / opponentCards.length || 5;
    
    const neededSum = currentSum + (opponentAvg + 0.5);
    
    const cardEvaluations = remainingCards.map(card => {
      const projectedSum = currentSum + card;
      const winProbability = this.calculateWinProbability(projectedSum, opponentCards);
      
      let score = winProbability * 100;
      
      if (winProbability < 0.5 && card >= 7) {
        score -= (card * 2);
      }
      
      if (winProbability < 0.3 && card <= 3) {
        score += (4 - card) * 10;
      }
      
      return { card, score };
    });
    
    cardEvaluations.sort((a, b) => b.score - a.score);
    
    if (roundImportance > 0.8 && Math.random() < 0.3) {
      const bluffCard = this.selectBluffCard(remainingCards, cardEvaluations);
      if (bluffCard) {
        return this.playCard(bluffCard);
      }
    }
    
    return this.playCard(cardEvaluations[0].card);
  }

  calculateRoundImportance() {
    const roundsLeft = 9 - this.roundNumber;
    const diff = Math.abs(this.aiScore - this.playerScore);
    
    if (roundsLeft === 0) return 1;
    if (diff >= roundsLeft + 1) return 0.2;
    
    const importance = 0.5 + (diff / roundsLeft) * 0.5;
    return Math.min(1, Math.max(0.2, importance));
  }

  calculateWinProbability(projectedSum, opponentCards) {
    if (opponentCards.length === 0) return 0.5;
    
    let wins = 0;
    const possibleSums = opponentCards.map(oppCard => projectedSum - oppCard);
    
    wins = possibleSums.filter(sum => sum > 0).length;
    
    const ties = possibleSums.filter(sum => sum === 0).length;
    
    return (wins + ties * 0.5) / possibleSums.length;
  }

  selectBluffCard(remainingCards, evaluations) {
    if (evaluations.length > 1) {
      const midCards = remainingCards.filter(c => c >= 3 && c <= 7);
      const nonTopMidCards = midCards.filter(c => c !== evaluations[0].card);
      
      if (nonTopMidCards.length > 0) {
        return this.selectRandomCard(nonTopMidCards);
      }
    }
    return null;
  }

  selectRandomCard(cardArray) {
    if (cardArray.length === 0) return 5;
    return cardArray[Math.floor(Math.random() * cardArray.length)];
  }

  playCard(cardValue) {
    const index = this.remainingCards.indexOf(cardValue);
    if (index !== -1) {
      this.remainingCards.splice(index, 1);
      this.usedCards.push(cardValue);
      return cardValue;
    }
    return this.playRandomCard();
  }

  playRandomCard() {
    return this.playCard(this.selectRandomCard(this.remainingCards));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
});
