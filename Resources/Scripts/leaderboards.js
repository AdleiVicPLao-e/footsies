// src/leaderboard.js
export class Leaderboard {
  constructor() {
    this.storageKey = "blackjack_leaderboard";
    this.entries = this.loadEntries();
  }

  initializeLeaderboardUI() {
    const app = document.getElementById("app");
    app.innerHTML = this.createLeaderboardHTML();
    this.attachLeaderboardEventListeners();
    this.renderLeaderboard();
  }

  createLeaderboardHTML() {
    return `
            <div class="leaderboard-container">
                <header class="leaderboard-header">
                    <h1>🏆 Tournament Hall of Fame</h1>
                    <p class="subtitle">Best Blackjack Players</p>
                </header>

                <div class="leaderboard-content">
                    <div class="leaderboard-filters">
                        <div class="filter-group">
                            <label for="difficulty-filter">Filter by Difficulty:</label>
                            <select id="difficulty-filter" class="filter-select">
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="player-count-filter">Players per Game:</label>
                            <select id="player-count-filter" class="filter-select">
                                <option value="all">Any Number</option>
                                <option value="2">2 Players</option>
                                <option value="3">3 Players</option>
                                <option value="4">4 Players</option>
                                <option value="5+">5+ Players</option>
                            </select>
                        </div>

                        <button class="btn btn-secondary" id="clear-leaderboard">
                            🗑️ Clear Records
                        </button>
                    </div>

                    <div class="leaderboard-stats">
                        <div class="stat-card">
                            <div class="stat-value" id="total-tournaments">0</div>
                            <div class="stat-label">Tournaments Played</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="best-score">0</div>
                            <div class="stat-label">Best Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="win-rate">0%</div>
                            <div class="stat-label">Win Rate</div>
                        </div>
                    </div>

                    <div class="leaderboard-list-container">
                        <table class="leaderboard-table" id="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Difficulty</th>
                                    <th>Players</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody id="leaderboard-body">
                                <!-- Entries will be populated here -->
                            </tbody>
                        </table>
                    </div>

                    <div class="leaderboard-actions">
                        <button class="btn btn-primary" id="back-to-lobby">
                            ← Back to Lobby
                        </button>
                        <button class="btn btn-secondary" id="export-data">
                            📤 Export Data
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  attachLeaderboardEventListeners() {
    document
      .getElementById("difficulty-filter")
      .addEventListener("change", () => this.renderLeaderboard());
    document
      .getElementById("player-count-filter")
      .addEventListener("change", () => this.renderLeaderboard());
    document
      .getElementById("clear-leaderboard")
      .addEventListener("click", () => this.clearLeaderboard());
    document
      .getElementById("back-to-lobby")
      .addEventListener("click", () => this.backToLobby());
    document
      .getElementById("export-data")
      .addEventListener("click", () => this.exportData());
  }

  addEntry(entry) {
    const newEntry = {
      id: Date.now(),
      playerName: entry.playerName || "Player 1",
      score: entry.score,
      difficulty: entry.difficulty,
      playerCount: entry.playerCount,
      date: new Date().toISOString(),
      duration: entry.duration,
      wins: entry.wins,
      totalGames: entry.totalGames,
    };

    this.entries.push(newEntry);
    this.entries.sort((a, b) => b.score - a.score); // Sort by score descending
    this.saveEntries();

    // Only render if we're in the leaderboard view
    if (document.getElementById("difficulty-filter")) {
      this.renderLeaderboard();
    }
  }

  // In leaderboards.js - update the renderLeaderboard method
  renderLeaderboard() {
    const difficultyFilter = document.getElementById("difficulty-filter");
    const playerCountFilter = document.getElementById("player-count-filter");

    // Check if filter elements exist (they only exist in the leaderboard view)
    if (!difficultyFilter || !playerCountFilter) {
      // This is normal when we're not in the leaderboard view
      return;
    }

    const difficultyFilterValue = difficultyFilter.value;
    const playerCountFilterValue = playerCountFilter.value;

    let filteredEntries = this.entries;

    // Apply filters
    if (difficultyFilterValue !== "all") {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.difficulty === difficultyFilterValue
      );
    }

    if (playerCountFilterValue !== "all") {
      if (playerCountFilterValue === "5+") {
        filteredEntries = filteredEntries.filter(
          (entry) => entry.playerCount >= 5
        );
      } else {
        filteredEntries = filteredEntries.filter(
          (entry) => entry.playerCount === parseInt(playerCountFilterValue)
        );
      }
    }

    // Update stats
    this.updateStats(filteredEntries);

    // Render table
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) {
      console.log("Leaderboard table body not found");
      return;
    }

    tbody.innerHTML = "";

    if (filteredEntries.length === 0) {
      tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-entries">
                    No tournament records found. Play some games to see your scores here!
                </td>
            </tr>
        `;
      return;
    }

    filteredEntries.forEach((entry, index) => {
      const row = document.createElement("tr");

      // Add medal emojis for top 3
      let medal = "";
      if (index === 0) medal = "🥇";
      else if (index === 1) medal = "🥈";
      else if (index === 2) medal = "🥉";

      row.innerHTML = `
            <td class="rank-cell">
                <span class="rank-number">${index + 1}</span>
                ${medal}
            </td>
            <td class="player-cell">${entry.playerName}</td>
            <td class="score-cell">${entry.score}</td>
            <td class="difficulty-cell">
                <span class="difficulty-badge difficulty-${entry.difficulty}">
                    ${this.capitalizeFirst(entry.difficulty)}
                </span>
            </td>
            <td class="players-cell">${entry.playerCount} players</td>
            <td class="date-cell">${this.formatDate(entry.date)}</td>
            <td class="duration-cell">${entry.duration}</td>
        `;
      tbody.appendChild(row);
    });
  }

  updateStats(entries) {
    document.getElementById("total-tournaments").textContent = entries.length;

    const bestScore =
      entries.length > 0 ? Math.max(...entries.map((e) => e.score)) : 0;
    document.getElementById("best-score").textContent = bestScore;

    const winRate =
      entries.length > 0
        ? Math.round(
            (entries.reduce((sum, e) => sum + e.wins / e.totalGames, 0) /
              entries.length) *
              100
          )
        : 0;
    document.getElementById("win-rate").textContent = `${winRate}%`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  clearLeaderboard() {
    if (
      confirm(
        "Are you sure you want to clear all leaderboard records? This cannot be undone."
      )
    ) {
      this.entries = [];
      this.saveEntries();
      this.renderLeaderboard();
    }
  }

  backToLobby() {
    const event = new CustomEvent("showLobby");
    document.dispatchEvent(event);
  }

  exportData() {
    const dataStr = JSON.stringify(this.entries, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `blackjack_leaderboard_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  }

  loadEntries() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading leaderboard entries:", error);
      return [];
    }
  }

  saveEntries() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.error("Error saving leaderboard entries:", error);
    }
  }
}
