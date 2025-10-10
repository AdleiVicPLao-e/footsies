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

    const players = [...this.players];

    // Ensure even number of players (add a dummy "bye" if odd)
    if (players.length % 2 !== 0) players.push("BYE");

    const numRounds = players.length - 1;
    const half = players.length / 2;

    const schedule = [];

    // Generate the balanced round-robin match schedule
    for (let round = 0; round < numRounds; round++) {
      const roundMatches = [];

      for (let i = 0; i < half; i++) {
        const p1 = players[i];
        const p2 = players[players.length - 1 - i];

        // Skip if a "BYE" is involved
        if (p1 !== "BYE" && p2 !== "BYE") {
          roundMatches.push([p1, p2]);
        }
      }

      schedule.push(roundMatches);

      // Rotate players (keep the first fixed)
      const fixed = players[0];
      const rest = players.slice(1);
      rest.unshift(rest.pop()); // rotate last element to front
      players.splice(1, players.length - 1, ...rest);
    }

    console.log("Generated Round Robin Schedule:", schedule);

    // Create and store all Game objects in this.games based on schedule
    for (let round = 0; round < schedule.length; round++) {
      for (const [p1Name, p2Name] of schedule[round]) {
        const player1 = this.playerObjects.get(p1Name);
        const player2 = this.playerObjects.get(p2Name);

        if (!player1 || !player2) {
          console.error(
            `Could not find player objects for: ${p1Name} or ${p2Name}`
          );
          continue;
        }

        const game = new Game(player1, player2);
        this.games.push(game);
        console.log(
          `Created Round ${round + 1} game: ${p1Name} (${
            player1.cardDesign
          }) vs ${p2Name} (${player2.cardDesign})`
        );
      }
    }

    console.log(`✅ Total games created: ${this.games.length}`);

    // Start first game
    if (this.games.length > 0) {
      this.currentGameIndex = 0;
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

  recordWin(
    winnerName,
    loserName,
    winnerHandValue = 0,
    loserHandValue = 0,
    isBlackjack = false,
    isTie = false
  ) {
    console.log(`🔍 recordWin called for: ${winnerName} vs ${loserName}`);
    console.log(`📊 Before - scores:`, Array.from(this.scores.entries()));

    // Initialize streaks if needed
    if (!this.streaks) this.streaks = new Map();

    // --- Handle Tie Case ---
    if (isTie) {
      [winnerName, loserName].forEach((name) => {
        const currentScore = this.scores.get(name) || 0;
        this.scores.set(name, currentScore + 0.5);
        this.streaks.set(name, 0); // reset streak
      });
      console.log(`🤝 Tie detected: ${winnerName} and ${loserName} both +0.5`);
    }

    // --- Handle Win Case ---
    else if (winnerName && loserName) {
      const currentScore = this.scores.get(winnerName) || 0;
      const currentStreak = this.streaks.get(winnerName) || 0;

      // --- Calculate Win Margin ---
      const margin = Math.max(0, winnerHandValue - loserHandValue);
      let points = 1 + margin / 5;

      // --- Add Blackjack Bonus ---
      if (isBlackjack) points += 0.5;

      // --- Apply Streak Multiplier ---
      const newStreak = currentStreak + 1;
      const streakBonus = 1 + newStreak * 0.05; // +5% per win
      points *= streakBonus;

      // --- Update Winner ---
      this.scores.set(winnerName, currentScore + points);
      this.streaks.set(winnerName, newStreak);

      // --- Reset Loser Streak ---
      if (this.streaks.has(loserName)) this.streaks.set(loserName, 0);

      console.log(
        `🏆 ${winnerName} beats ${loserName}: +${points.toFixed(
          2
        )} points (Margin ${margin}, Streak x${streakBonus.toFixed(2)})`
      );
    } else {
      console.log("❌ Invalid winner/loser data");
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
