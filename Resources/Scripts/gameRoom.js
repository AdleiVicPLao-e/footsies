// gameRoom.js
import { Game } from './game.js';

export class GameRoom {
    constructor() {
        this.games = [];
        this.currentGameIndex = 0;
        this.players = [];
        this.scores = new Map();
    }
    
    addPlayer(playerName) {
        this.players.push(playerName);
        this.scores.set(playerName, 0);
    }
    
    startRoundRobin() {
        // Create games for all player combinations
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                this.games.push(new Game(this.players[i], this.players[j], false));
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