// game.js
import { Deck } from './deck.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

export class Game {
    constructor(player1Name, player2Name, isPlayer2Human = false) {
        this.deck = new Deck();
        this.player1 = new Player(player1Name);
        this.player2 = isPlayer2Human ? new Player(player2Name) : new Enemy(player2Name);
        this.currentPlayer = this.player1;
        this.gameOver = false;
        this.winner = null;
        this.revealEnemyCards = false;
        this.processingAITurn = false;
        this.onStateChange = null; // Callback for UI updates
    }
    
    // Set callback for UI updates
    setOnStateChange(callback) {
        this.onStateChange = callback;
    }
    
    // Helper method to trigger UI updates
    triggerUIUpdate() {
        if (this.onStateChange) {
            this.onStateChange();
        }
    }
    
    startGame() {
        // Deal initial cards
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
        
        this.revealEnemyCards = false;
        this.processingAITurn = false;
        this.triggerUIUpdate(); // Update UI after game starts
    }
    
    nextTurn() {
        if (this.gameOver || this.processingAITurn) return;
        
        // If current player is AI, make automatic move
        if (!this.currentPlayer.isHuman) {
            this.handleAITurn();
        }
    }
    
    handleAITurn() {
        if (this.gameOver || this.processingAITurn) return;
        
        this.processingAITurn = true;
        this.triggerUIUpdate(); // Update UI to show AI is thinking
        
        // Use setTimeout to avoid blocking and allow UI updates
        setTimeout(() => {
            if (this.currentPlayer.shouldHit() && !this.currentPlayer.isStanding) {
                this.hit();
            } else {
                this.stand();
            }
            this.processingAITurn = false;
        }, 1000); // 1 second delay for AI "thinking"
    }
    
    hit() {
        if (this.gameOver || this.currentPlayer.isStanding) {
            this.processingAITurn = false;
            return;
        }
        
        console.log(`${this.currentPlayer.name} hits`);
        this.currentPlayer.addCard(this.deck.drawCard());
        this.triggerUIUpdate(); // Update UI after hit
        
        this.checkGameState();
        
        // Reveal enemy cards if player busts
        if (this.player1.score > 21) {
            this.revealEnemyCards = true;
        }
        
        // If game is not over and it's still AI's turn, continue their turn
        if (!this.gameOver && !this.currentPlayer.isHuman && !this.currentPlayer.isStanding) {
            // Use setTimeout to avoid recursion and stack overflow
            setTimeout(() => {
                if (this.currentPlayer.shouldHit()) {
                    this.hit();
                } else {
                    this.stand();
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
        
        console.log(`${this.currentPlayer.name} stands`);
        this.currentPlayer.stand();
        
        // Reveal enemy cards when human stands
        if (this.currentPlayer === this.player1) {
            this.revealEnemyCards = true;
        }
        
        this.switchPlayer();
        this.triggerUIUpdate(); // Update UI after stand
        
        this.checkGameState();
        
        this.processingAITurn = false;
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        console.log(`Switched to ${this.currentPlayer.name}'s turn`);
        this.triggerUIUpdate(); // Update UI after player switch
    }
    
    checkGameState() {
        // Check for bust
        if (this.player1.score > 21) {
            console.log('Player 1 busts!');
            this.revealEnemyCards = true;
            this.endGame(this.player2);
            return;
        }
        
        if (this.player2.score > 21) {
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
        
        // If it's AI's turn and game isn't over, continue their turn
        if (!this.gameOver && !this.currentPlayer.isHuman && !this.currentPlayer.isStanding) {
            setTimeout(() => this.handleAITurn(), 1000);
        }
        
        this.triggerUIUpdate(); // Update UI after state check
    }
    
    determineWinner() {
        console.log(`Determining winner: Player1: ${this.player1.score}, Player2: ${this.player2.score}`);
        if (this.player1.score > this.player2.score) {
            this.endGame(this.player1);
        } else if (this.player2.score > this.player1.score) {
            this.endGame(this.player2);
        } else {
            this.endGame(null);
        }
    }
    
    endGame(winner) {
        console.log(`Game over! Winner: ${winner ? winner.name : 'Tie'}`);
        this.gameOver = true;
        this.winner = winner;
        this.revealEnemyCards = true;
        this.processingAITurn = false;
        this.triggerUIUpdate(); // Update UI when game ends
    }
    
    resetGame() {
        this.deck = new Deck();
        this.player1.clearHand();
        this.player2.clearHand();
        this.currentPlayer = this.player1;
        this.gameOver = false;
        this.winner = null;
        this.revealEnemyCards = false;
        this.processingAITurn = false;
        this.startGame();
    }
    
    // Method to check if enemy cards should be shown
    shouldShowEnemyCards() {
        return this.revealEnemyCards || this.gameOver;
    }
    
    // Method to get enemy hand for display (only second card hidden)
    getEnemyHandForDisplay() {
        if (this.shouldShowEnemyCards()) {
            return this.player2.hand.map(card => ({ ...card, isHidden: false }));
        } else {
            // Return array with only the second card hidden
            return this.player2.hand.map((card, index) => ({
                ...card,
                isHidden: index === 1 // Hide only the second card (index 1)
            }));
        }
    }
    
    // Method to get enemy score for display
    getEnemyScoreForDisplay() {
        if (this.shouldShowEnemyCards()) {
            return this.player2.score; // Show actual score
        } else {
            // Only show the value of the first card when cards are hidden
            const firstCardValue = this.player2.hand.length > 0 ? this.player2.hand[0].value : 0;
            return firstCardValue + ' + ?'; // Show "X + ?" format
        }
    }
}