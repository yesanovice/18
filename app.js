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
  }
  
  initEventListeners() {
    this.playButton.addEventListener('click', () => this.playCard());
    this.nextRoundButton.addEventListener('click', () => this.nextRound());
    this.newGameButton.addEventListener('click', () => this.newGame());
    this.modalCloseButton.addEventListener('click', () => this.closeModal());
    
    // Card selection
    this.playerCardsElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('card') && !e.target.classList.contains('empty')) {
        this.selectCard(parseInt(e.target.textContent));
      }
    });
  }
  
  newGame() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.round = 1;
    this.phase = 1;
    this.updateScoreboard();
    this.closeModal();
    this.resetRound();
    this.dealCards();
  }
  
  dealCards() {
    // Create two sets of 1-9 cards
    this.playerCards = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
    this.computerCards = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
    
    // Initialize AI
    this.ai = new EnhancedAIPlayer();
    
    this.renderPlayerCards();
    this.resetPlayArea();
    this.updateControls();
  }
  
  renderPlayerCards() {
    this.playerCardsElement.innerHTML = '';
    
    // Sort cards for better visibility
    const sortedCards = [...this.playerCards].sort((a, b) => a - b);
    
    sortedCards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.textContent = card;
      this.playerCardsElement.appendChild(cardElement);
    });
  }
  
  selectCard(cardValue) {
    // Only allow selection if we're in card selection phase
    if (this.phase !== 1 && this.phase !== 2) return;
    
    // Deselect previous selection
    if (this.selectedCard !== null) {
      const cards = document.querySelectorAll('.player-cards .card');
      cards.forEach(card => {
        if (parseInt(card.textContent) === this.selectedCard) {
          card.classList.remove('selected');
        }
      });
    }
    
    // Select new card
    this.selectedCard = cardValue;
    const cards = document.querySelectorAll('.player-cards .card');
    cards.forEach(card => {
      if (parseInt(card.textContent) === cardValue) {
        card.classList.add('selected');
      }
    });
    
    this.playButton.disabled = false;
  }
  
  playCard() {
    if (this.selectedCard === null) return;
    
    if (this.phase === 1) {
      this.playPhase1();
    } else if (this.phase === 2) {
      this.playPhase2();
    }
  }
  
  playPhase1() {
    // Player plays first card
    this.playerPhase1Card = this.selectedCard;
    
    // Remove only one instance of the selected card
    const cardIndex = this.playerCards.indexOf(this.selectedCard);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
    }
    
    // Computer plays first card
    this.computerPhase1Card = this.ai.playFirstCard();
    
    // Update UI
    this.playerPhase1Element.textContent = this.playerPhase1Card;
    this.playerPhase1Element.className = 'card';
    this.computerHiddenPhase1.textContent = '?';
    this.computerPhase1Element.textContent = this.computerPhase1Card;
    
    // Move to phase 2
    this.phase = 2;
    this.selectedCard = null;
    this.renderPlayerCards();
    this.updateControls();
  }
  
  playPhase2() {
    // Player plays second card
    this.playerPhase2Card = this.selectedCard;
    
    // Remove only one instance of the selected card
    const cardIndex = this.playerCards.indexOf(this.selectedCard);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
    }
    
    // Computer plays second card
    this.computerPhase2Card = this.ai.playSecondCard(this.playerPhase1Card, this.computerPhase1Card);
    
    // Update UI
    this.playerPhase2Element.textContent = this.playerPhase2Card;
    this.playerPhase2Element.className = 'card';
    this.computerHiddenPhase2.textContent = '?';
    this.computerPhase2Element.textContent = this.computerPhase2Card;
    
    // Record played cards for AI
    this.ai.recordPlayedCards(this.playerPhase1Card, this.computerPhase1Card);
    this.ai.recordPlayedCards(this.playerPhase2Card, this.computerPhase2Card);
    
    // Calculate sums
    const playerSum = this.playerPhase1Card + this.playerPhase2Card;
    const computerSum = this.computerPhase1Card + this.computerPhase2Card;
    
    // Update sum display
    this.playerSumElement.textContent = playerSum;
    this.computerSumElement.textContent = computerSum;
    
    // Determine round winner
    let roundWinner = null;
    if (playerSum > computerSum) {
      roundWinner = 'player';
      this.playerScore++;
    } else if (computerSum > playerSum) {
      roundWinner = 'computer';
      this.computerScore++;
    } else {
      roundWinner = 'tie';
    }
    
    // Update AI score
    this.ai.updateScores(roundWinner === 'computer');
    
    // Show result
    this.showResult(roundWinner, playerSum, computerSum);
    
    // Update controls for next round
    this.phase = 3; // Waiting for next round
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
    
    // Check for game over
    if (this.playerScore >= 5 || this.computerScore >= 5 || this.round >= 9) {
      this.showGameOver();
    }
  }
  
  showGameOver() {
    if (this.playerScore > this.computerScore) {
      this.resultTitle.textContent = 'You Won the Game!';
      this.resultMessage.textContent = `Final Score: You ${this.playerScore} - ${this.computerScore} Computer`;
    } else if (this.computerScore > this.playerScore) {
      this.resultTitle.textContent = 'Computer Won the Game';
      this.resultMessage.textContent = `Final Score: Computer ${this.computerScore} - ${this.playerScore} You`;
    } else {
      this.resultTitle.textContent = 'Game Tied';
      this.resultMessage.textContent = `Final Score: ${this.playerScore}-${this.computerScore}`;
    }
  }
  
  closeModal() {
    this.resultModal.style.display = 'none';
  }
  
  nextRound() {
    this.round++;
    if (this.round <= 9) {
      this.resetRound();
      this.updateScoreboard();
      this.updateControls();
    } else {
      this.newGame();
    }
  }
  
  resetRound() {
    this.phase = 1;
    this.selectedCard = null;
    this.playerPhase1Card = null;
    this.playerPhase2Card = null;
    this.computerPhase1Card = null;
    this.computerPhase2Card = null;
    
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
    this.playButton.disabled = this.phase === 3 || this.selectedCard === null;
    this.nextRoundButton.disabled = this.phase !== 3;
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
    
    // Also track AI's own cards
    const aiIndex = this.remainingCards.indexOf(aiCard);
    if (aiIndex !== -1) {
      this.remainingCards.splice(aiIndex, 1);
      this.usedCards.push(aiCard);
    }
  }

  playFirstCard() {
    const roundImportance = this.calculateRoundImportance();
    const remainingCards = [...this.remainingCards];
    
    // Early game: play mid-range cards
    if (this.roundNumber < 3) {
      const midCards = remainingCards.filter(c => c >= 3 && c <= 7);
      if (midCards.length > 0) {
        return this.playCard(this.selectRandomCard(midCards));
      }
    }
    
    // Mid/late game: adjust based on score
    if (roundImportance > 0.7) {
      // Important round - play stronger card
      const strongCards = remainingCards.filter(c => c >= 6);
      if (strongCards.length > 0) {
        return this.playCard(this.selectRandomCard(strongCards));
      }
    } else {
      // Less important - conserve high cards
      const lowMidCards = remainingCards.filter(c => c <= 5);
      if (lowMidCards.length > 0) {
        return this.playCard(this.selectRandomCard(lowMidCards));
      }
    }
    
    // Fallback
    return this.playCard(this.selectRandomCard(remainingCards));
  }

  playSecondCard(playerFirstCard, aiFirstCard) {
    this.recordPlayedCards(playerFirstCard, aiFirstCard);
    const currentSum = playerFirstCard + aiFirstCard;
    const remainingCards = [...this.remainingCards];
    const roundImportance = this.calculateRoundImportance();
    
    // Estimate opponent's likely second card
    const opponentCards = this.opponentModel.remaining;
    const opponentAvg = opponentCards.reduce((a, b) => a + b, 0) / opponentCards.length || 5;
    
    // Calculate needed sum to win
    const neededSum = currentSum + (opponentAvg + 0.5); // slight bias
    
    // Evaluate each possible card
    const cardEvaluations = remainingCards.map(card => {
      const projectedSum = currentSum + card;
      const winProbability = this.calculateWinProbability(projectedSum, opponentCards);
      
      // Score based on win probability and card value conservation
      let score = winProbability * 100;
      
      // Penalize using high cards unnecessarily
      if (winProbability < 0.5 && card >= 7) {
        score -= (card * 2);
      }
      
      // Bonus for using low cards when likely to lose anyway
      if (winProbability < 0.3 && card <= 3) {
        score += (4 - card) * 10;
      }
      
      return { card, score };
    });
    
    // Sort by best score
    cardEvaluations.sort((a, b) => b.score - a.score);
    
    // Occasionally bluff in important rounds
    if (roundImportance > 0.8 && Math.random() < 0.3) {
      const bluffCard = this.selectBluffCard(remainingCards, cardEvaluations);
      if (bluffCard) {
        return this.playCard(bluffCard);
      }
    }
    
    // Play best card
    return this.playCard(cardEvaluations[0].card);
  }

  calculateRoundImportance() {
    const roundsLeft = 9 - this.roundNumber;
    const diff = Math.abs(this.aiScore - this.playerScore);
    
    if (roundsLeft === 0) return 1;
    if (diff >= roundsLeft + 1) return 0.2; // match already decided
    
    // Calculate how critical this round is
    const importance = 0.5 + (diff / roundsLeft) * 0.5;
    return Math.min(1, Math.max(0.2, importance));
  }

  calculateWinProbability(projectedSum, opponentCards) {
    if (opponentCards.length === 0) return 0.5;
    
    let wins = 0;
    const possibleSums = opponentCards.map(oppCard => projectedSum - oppCard);
    
    // Count how many would result in AI win
    wins = possibleSums.filter(sum => sum > 0).length;
    
    // Add partial credit for ties
    const ties = possibleSums.filter(sum => sum === 0).length;
    
    return (wins + ties * 0.5) / possibleSums.length;
  }

  selectBluffCard(remainingCards, evaluations) {
    // Try to find a card that's not the obvious best play
    if (evaluations.length > 1) {
      // Prefer a mid-range card that's not the top evaluation
      const midCards = remainingCards.filter(c => c >= 3 && c <= 7);
      const nonTopMidCards = midCards.filter(c => c !== evaluations[0].card);
      
      if (nonTopMidCards.length > 0) {
        return this.selectRandomCard(nonTopMidCards);
      }
    }
    return null;
  }

  selectRandomCard(cardArray) {
    if (cardArray.length === 0) return 5; // fallback
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

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
});
