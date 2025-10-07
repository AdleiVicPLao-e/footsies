// Scripts/gameRoom.js
import { Game } from './game.js';

export class GameRoom {
    constructor() {
        this.games = [];
        this.currentGameIndex = 0;
        this.players = [];
        this.scores = new Map();
        this.enemies = []; // Track enemy objects
    }
    
    addPlayer(playerName) {
        this.players.push(playerName);
        this.scores.set(playerName, 0);
    }
    
    // Add this missing method
    addEnemy(enemy) {
        this.players.push(enemy.name);
        this.scores.set(enemy.name, 0);
        this.enemies.push(enemy);
    }
    
    startRoundRobin() {
        // Create games for all player combinations
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const player1 = this.players[i];
                const player2 = this.players[j];
                
                // Check if players are enemies and get their types
                const enemy1 = this.enemies.find(e => e.name === player1);
                const enemy2 = this.enemies.find(e => e.name === player2);
                
                const isPlayer1Human = !enemy1;
                const isPlayer2Human = !enemy2;
                
                // Get enemy type for AI players
                let enemyType1 = 'IntermediateEnemy';
                let enemyType2 = 'IntermediateEnemy';
                
                if (enemy1) enemyType1 = enemy1.constructor.name;
                if (enemy2) enemyType2 = enemy2.constructor.name;
                
                // Create game with appropriate enemy types
                const game = new Game(player1, player2, isPlayer2Human, enemyType2);
                this.games.push(game);
            }
        }
        
        // Start first game
        if (this.games.length > 0) {
            this.games[this.currentGameIndex].startGame();
        }
    }
    
    nextGame() {
        if (this.currentGameIndex < this.games.length - 1) {
            this.currentGameIndex++;
            this.games[this.currentGameIndex].startGame();
            return true;
        }
        return false; // No more games
    }
    
    recordWin(winnerName) {
        if (winnerName) {
            this.scores.set(winnerName, this.scores.get(winnerName) + 1);
        }
    }
    
    getLeaderboard() {
        return Array.from(this.scores.entries())
            .sort((a, b) => b[1] - a[1]);
    }
}