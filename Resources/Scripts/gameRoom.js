// Scripts/gameRoom.js
import { Game } from "./game.js";
import { Player } from "./player.js";

export class GameRoom {
  constructor() {
    this.games = [];
    this.currentGameIndex = 0;
    this.players = [];
    this.scores = new Map();
    this.enemies = []; // Track enemy objects
    this.playerObjects = new Map(); // Add this line - initialize the Map

    console.log("GameRoom initialized with empty scores");
  }

  addPlayer(playerName, cardDesign = "player") {
    const player = new Player(playerName, true, cardDesign);
    this.players.push(playerName);
    this.scores.set(playerName, 0);
    this.playerObjects.set(playerName, player); // Now this will work
    console.log(`Added player: ${playerName} with ${cardDesign} cards`);
  }

  addEnemy(enemy) {
    this.players.push(enemy.name);
    this.scores.set(enemy.name, 0);
    this.enemies.push(enemy);
    this.playerObjects.set(enemy.name, enemy); // Now this will work
    console.log(`Added enemy: ${enemy.name} with ${enemy.cardDesign} cards`);
  }

  startRoundRobin() {
    console.log("Starting round robin tournament with players:", this.players);
    console.log("Initial scores:", Array.from(this.scores.entries()));

    // Create games for all player combinations
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const player1Name = this.players[i];
        const player2Name = this.players[j];

        // Get player objects from playerObjects Map instead of searching enemies
        const player1 = this.playerObjects.get(player1Name);
        const player2 = this.playerObjects.get(player2Name);

        if (!player1 || !player2) {
          console.error(
            `Could not find player objects for: ${player1Name} or ${player2Name}`
          );
          continue;
        }

        // Create game with the actual player objects
        const game = new Game(player1, player2);
        this.games.push(game);
        console.log(
          `Created game: ${player1Name} (${player1.cardDesign}) vs ${player2Name} (${player2.cardDesign})`
        );
      }
    }

    console.log(`Total games created: ${this.games.length}`);

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
    console.log(`🔍 recordWin called for: ${winnerName}`);
    console.log(`📊 Before - scores:`, Array.from(this.scores.entries()));

    if (winnerName) {
      const currentScore = this.scores.get(winnerName) || 0;
      const newScore = currentScore + 1;
      this.scores.set(winnerName, newScore);
      console.log(`✅ ${winnerName}: ${currentScore} → ${newScore}`);
    } else {
      console.log("❌ No winner name provided");
    }

    console.log(`📊 After - scores:`, Array.from(this.scores.entries()));
    console.log("---");
  }

  getLeaderboard() {
    const leaderboard = Array.from(this.scores.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    console.log("GameRoom.getLeaderboard returning:", leaderboard);
    return leaderboard;
  }
}
