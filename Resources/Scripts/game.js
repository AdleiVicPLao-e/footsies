// game.js
import { Deck } from './deck.js';
import { Player } from './player.js';

export class Game {
    constructor(player1, player2) {
        this.deck = new Deck();
        
        // Handle case where we get objects instead of Player instances
        this.player1 = this.ensurePlayerObject(player1);
        this.player2 = this.ensurePlayerObject(player2);
        
        this.currentPlayer = this.player1;
        this.gameOver = false;
        this.winner = null;
        this.revealEnemyCards = false;
        this.processingAITurn = false;
        this.onStateChange = null;
        
        // Track if this is an AI vs AI game
        this.isAIVsAI = !this.player1.isHuman && !this.player2.isHuman;
        
        console.log(`Game created: ${this.player1.name} (${this.player1.isHuman ? 'Human' : 'AI'}) vs ${this.player2.name} (${this.player2.isHuman ? 'Human' : 'AI'})`);
        console.log(`Is AI vs AI: ${this.isAIVsAI}`);
    }
    
    // Helper method to ensure we have proper Player objects
    ensurePlayerObject(player) {
        // If it's already a Player instance (or Enemy which extends Player), return it
        if (player && typeof player.addCard === 'function') {
            return player;
        }
        // If it's a plain object with name and isHuman, create a Player
        else if (player && player.name && typeof player.isHuman === 'boolean') {
            return new Player(player.name, player.isHuman);
        }
        // Fallback - create a human player
        else {
            console.warn('Invalid player object, creating default human player:', player);
            return new Player(player?.name || 'Unknown', true);
        }
    }
    
    setOnStateChange(callback) {
        this.onStateChange = callback;
    }
    
    triggerUIUpdate() {
        if (this.onStateChange) {
            setTimeout(() => this.onStateChange(), 0);
        }
    }
    
    startGame() {
        this.player1.clearHand();
        this.player2.clearHand();
        this.currentPlayer = this.player1;
        this.gameOver = false;
        this.winner = null;
        this.revealEnemyCards = false;
        this.processingAITurn = false;
        
        // Deal initial cards
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
        
        this.triggerUIUpdate();
        
        console.log(`Game started. Scores: ${this.player1.name}: ${this.player1.score}, ${this.player2.name}: ${this.player2.score}`);
        
        // If it's AI vs AI, start the AI turns automatically
        if (this.isAIVsAI) {
            console.log("Starting AI vs AI game automatically");
            this.startAIVsAIGame();
        } else if (!this.currentPlayer.isHuman) {
            console.log("Starting AI turn automatically");
            this.handleAITurn();
        }
    }
    
    startAIVsAIGame() {
        if (!this.isAIVsAI || this.gameOver) return;
        this.handleAITurn();
    }
    
    handleAITurn() {
        if (this.gameOver || this.processingAITurn) return;
        
        this.processingAITurn = true;
        this.triggerUIUpdate();
        
        setTimeout(() => {
            if (this.gameOver) {
                this.processingAITurn = false;
                return;
            }
            
            // For AI players, use their decision logic
            if (this.currentPlayer.shouldHit && !this.currentPlayer.isStanding && !this.currentPlayer.isBust()) {
                const shouldHit = this.currentPlayer.shouldHit();
                console.log(`AI ${this.currentPlayer.name} decision: ${shouldHit ? 'HIT' : 'STAND'}, Score: ${this.currentPlayer.score}`);
                if (shouldHit) {
                    this.hit();
                } else {
                    this.stand();
                }
            } else {
                this.stand();
            }
        }, 1000);
    }
    
    hit() {
        if (this.gameOver || this.currentPlayer.isStanding || this.currentPlayer.isBust()) {
            this.processingAITurn = false;
            return;
        }
        
        console.log(`${this.currentPlayer.name} hits, current score: ${this.currentPlayer.score}`);
        this.currentPlayer.addCard(this.deck.drawCard());
        console.log(`${this.currentPlayer.name} new score: ${this.currentPlayer.score}`);
        this.triggerUIUpdate();
        
        this.checkGameState();
        
        // In AI vs AI, always reveal cards
        if (this.isAIVsAI) {
            this.revealEnemyCards = true;
        } else if (this.player1.isBust()) {
            this.revealEnemyCards = true;
        }
        
        // Only continue AI turn if game is still active and it's still AI's turn and not bust
        if (!this.gameOver && !this.currentPlayer.isHuman && !this.currentPlayer.isStanding && !this.currentPlayer.isBust()) {
            setTimeout(() => {
                if (!this.gameOver && this.currentPlayer.shouldHit) {
                    if (this.currentPlayer.shouldHit()) {
                        this.hit();
                    } else {
                        this.stand();
                    }
                }
            }, 1000);
        } else {
            this.processingAITurn = false;
        }
    }
    
    stand() {
        if (this.gameOver) {
            this.processingAITurn = false;
            return;
        }
        
        console.log(`${this.currentPlayer.name} stands with score: ${this.currentPlayer.score}`);
        this.currentPlayer.stand();
        
        // In AI vs AI or when human stands, reveal cards
        if (this.isAIVsAI || this.currentPlayer === this.player1) {
            this.revealEnemyCards = true;
        }
        
        this.switchPlayer();
        this.triggerUIUpdate();
        
        this.checkGameState();
        
        this.processingAITurn = false;
    }
    
    switchPlayer() {
        if (this.gameOver) return;
        
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        console.log(`Switched to ${this.currentPlayer.name}'s turn, isHuman: ${this.currentPlayer.isHuman}`);
        this.triggerUIUpdate();
    }
    
    checkGameState() {
    if (this.gameOver) return;
    
    // Check for bust
    if (this.player1.isBust()) {
        console.log('Player 1 busts!');
        this.revealEnemyCards = true;
        this.endGame(this.player2);
        return;
    }
    
    if (this.player2.isBust()) {
        console.log('Player 2 busts!');
        this.revealEnemyCards = true;
        this.endGame(this.player1);
        return;
    }
    
    // Check if both players are standing
    if (this.player1.isStanding && this.player2.isStanding) {
        console.log('Both players stand - determining winner');
        this.revealEnemyCards = true;
        this.determineWinner();
        return;
    }
    
    // In AI vs AI, always continue the game automatically
    if (this.isAIVsAI && !this.gameOver && !this.currentPlayer.isStanding && !this.currentPlayer.isBust()) {
        setTimeout(() => {
            if (!this.gameOver) {
                this.handleAITurn();
            }
        }, 1000);
    }
    // In human vs AI, only continue if it's AI's turn
    else if (!this.gameOver && !this.currentPlayer.isHuman && !this.currentPlayer.isStanding && !this.currentPlayer.isBust()) {
        setTimeout(() => {
            if (!this.gameOver) {
                this.handleAITurn();
            }
        }, 1000);
    }
    
    this.triggerUIUpdate();
}
    
    determineWinner() {
        console.log(`Determining winner: ${this.player1.name}: ${this.player1.score}, ${this.player2.name}: ${this.player2.score}`);
        
        // If both bust, it's a tie
        if (this.player1.isBust() && this.player2.isBust()) {
            this.endGame(null);
        }
        // If player1 busts, player2 wins
        else if (this.player1.isBust()) {
            this.endGame(this.player2);
        }
        // If player2 busts, player1 wins
        else if (this.player2.isBust()) {
            this.endGame(this.player1);
        }
        // Otherwise, higher score wins
        else if (this.player1.score > this.player2.score) {
            this.endGame(this.player1);
        } else if (this.player2.score > this.player1.score) {
            this.endGame(this.player2);
        } else {
            this.endGame(null); // Tie
        }
    }
    
    endGame(winner) {
    console.log(`Game over! Winner: ${winner ? winner.name : 'Tie'}`);
    this.gameOver = true;
    this.winner = winner;
    this.revealEnemyCards = true;
    this.processingAITurn = false;
    
    // Debug: log the winner details
    if (winner) {
        console.log(`Winner details - name: "${winner.name}", isHuman: ${winner.isHuman}`);
    } else {
        console.log('Game ended in tie - no winner');
    }
    
    // Trigger UI update first
    this.triggerUIUpdate();
    
    // Then trigger game end handling after a short delay to ensure UI is updated
    setTimeout(() => {
        if (this.onGameEnd) {
            this.onGameEnd(winner);
        }
    }, 100);
}

setOnGameEnd(callback) {
    this.onGameEnd = callback;
}
    
    shouldShowEnemyCards() {
        // In AI vs AI, always show cards
        if (this.isAIVsAI) return true;
        return this.revealEnemyCards || this.gameOver;
    }
    
    getEnemyHandForDisplay() {
        if (this.shouldShowEnemyCards()) {
            return this.player2.hand.map(card => ({ ...card, isHidden: false }));
        } else {
            return this.player2.hand.map((card, index) => ({
                ...card,
                isHidden: index === 1
            }));
        }
    }
    
    getEnemyScoreForDisplay() {
        if (this.shouldShowEnemyCards()) {
            return this.player2.score;
        } else {
            const firstCardValue = this.player2.hand.length > 0 ? this.player2.hand[0].value : 0;
            return firstCardValue + ' + ?';
        }
    }
}