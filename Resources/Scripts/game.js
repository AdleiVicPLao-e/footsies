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
    }
    
    startGame() {
        // Deal initial cards
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
        this.player1.addCard(this.deck.drawCard());
        this.player2.addCard(this.deck.drawCard());
    }
    
    nextTurn() {
        if (this.gameOver) return;
        
        // If current player is AI, make automatic move
        if (!this.currentPlayer.isHuman) {
            this.handleAITurn();
        }
    }
    
    handleAITurn() {
        if (this.currentPlayer.shouldHit()) {
            this.hit();
        } else {
            this.stand();
        }
    }
    
    hit() {
        if (this.gameOver || this.currentPlayer.isStanding) return;
        
        this.currentPlayer.addCard(this.deck.drawCard());
        this.checkGameState();
        
        if (!this.gameOver && !this.currentPlayer.isStanding) {
            // Auto-advance turn for AI
            if (!this.currentPlayer.isHuman) {
                this.handleAITurn();
            }
        }
    }
    
    stand() {
        if (this.gameOver) return;
        
        this.currentPlayer.stand();
        this.switchPlayer();
        this.checkGameState();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    }
    
    checkGameState() {
        // Check for bust
        if (this.player1.score > 21) {
            this.endGame(this.player2);
            return;
        }
        
        if (this.player2.score > 21) {
            this.endGame(this.player1);
            return;
        }
        
        // Check if both players are standing
        if (this.player1.isStanding && this.player2.isStanding) {
            this.determineWinner();
            return;
        }
    }
    
    determineWinner() {
        if (this.player1.score > this.player2.score) {
            this.endGame(this.player1);
        } else if (this.player2.score > this.player1.score) {
            this.endGame(this.player2);
        } else {
            this.endGame(null); // Tie
        }
    }
    
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
    }
    
    resetGame() {
        this.deck = new Deck();
        this.player1.clearHand();
        this.player2.clearHand();
        this.currentPlayer = this.player1;
        this.gameOver = false;
        this.winner = null;
        this.startGame();
    }
}