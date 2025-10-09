// src/lobby.js
import { createEnemy } from "./enemy.js";

export class Lobby {
  constructor() {
    this.players = [];
    this.difficultySettings = {
      easy: {
        weight: 1,
        description: "Beginner - Hits until 16",
      },
      medium: {
        weight: 2,
        description: "Intermediate - Balanced play",
      },
      hard: {
        weight: 3,
        description: "Expert - Uses strategy tables",
      },
      random: {
        weight: 1.5,
        description: "Wild - Unpredictable",
      },
      adaptive: {
        weight: 2.5,
        description: "Custom - Learns from you",
      },
    };
    this.currentDifficulty = "medium";
    this.enemyCount = 3;
    this.MAX_ENEMIES = 8; // Add maximum limit
    this.MIN_ENEMIES = 1; // Add minimum limit
  }

  initializeLobbyUI() {
    const app = document.getElementById("app");
    app.innerHTML = this.createLobbyHTML();
    this.attachLobbyEventListeners();
  }

  createLobbyHTML() {
    return `
            <div class="lobby-container">
                <header class="lobby-header">
                    <img src="./Resources/Assets/Images/logo.png" alt="Game Logo" class="logo">
                    <h1>Blackjack Tournament Lobby</h1>
                    <p class="subtitle">Configure your tournament settings</p>
                </header>

                <div class="lobby-content">
                    <div class="settings-panel">
                        <div class="setting-group">
                            <label for="enemy-count" class="setting-label">Number of AI Players:</label>
                            <div class="input-group">
                                <button class="btn-stepper" id="decrease-enemies" type="button">-</button>
                                <input type="number" id="enemy-count" class="number-input" 
                                       value="${this.enemyCount}" 
                                       min="${this.MIN_ENEMIES}" 
                                       max="${this.MAX_ENEMIES}"
                                       oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                                <button class="btn-stepper" id="increase-enemies" type="button">+</button>
                            </div>
                            <span class="setting-description">Total players: <span id="total-players">${
                              this.enemyCount + 1
                            }</span> (You + <span id="ai-count">${
      this.enemyCount
    }</span> AI)</span>
                            <span class="setting-hint">Max: ${
                              this.MAX_ENEMIES
                            } AI players</span>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Tournament Difficulty:</label>
                            <div class="difficulty-options" id="difficulty-options">
                                ${this.createDifficultyOptions()}
                            </div>
                            <span class="setting-description" id="difficulty-description">${
                              this.difficultySettings[this.currentDifficulty]
                                .description
                            }</span>
                        </div>

                        <div class="setting-group" id="mixed-difficulty-group">
                            <label class="setting-label">AI Distribution:</label>
                            <div class="distribution-display" id="distribution-display">
                                ${this.createDistributionDisplay()}
                            </div>
                        </div>

                        <div class="tournament-preview">
                            <h3>Tournament Preview</h3>
                            <div class="preview-content" id="tournament-preview">
                                ${this.createTournamentPreview()}
                            </div>
                        </div>
                    </div>

                    <div class="lobby-actions">
                        <button class="btn btn-primary btn-large" id="start-tournament">
                            🚀 Start Tournament
                        </button>
                        <button class="btn btn-secondary" id="view-leaderboard">
                            📊 View Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  createDifficultyOptions() {
    const difficulties = Object.keys(this.difficultySettings);
    return difficulties
      .map(
        (diff) => `
            <label class="difficulty-option ${
              diff === this.currentDifficulty ? "selected" : ""
            }">
                <input type="radio" name="difficulty" value="${diff}" ${
          diff === this.currentDifficulty ? "checked" : ""
        }>
                <span class="difficulty-badge difficulty-${diff}">
                    ${this.capitalizeFirst(diff)}
                </span>
            </label>
        `
      )
      .join("");
  }

  createDistributionDisplay() {
    const distribution = this.calculateAIDistribution();
    return Object.entries(distribution)
      .map(([diff, count]) =>
        count > 0
          ? `<span class="distribution-item difficulty-${diff}">${count} ${this.capitalizeFirst(
              diff
            )}</span>`
          : ""
      )
      .join("");
  }

  createTournamentPreview() {
    const distribution = this.calculateAIDistribution();
    const totalGames = this.calculateTotalGames(this.enemyCount + 1);

    // Format large numbers to be readable
    const formatNumber = (num) => {
      if (num > 1000) {
        return num.toLocaleString();
      }
      return num.toString();
    };

    return `
            <div class="preview-item">
                <span>Total Players:</span>
                <span>${formatNumber(this.enemyCount + 1)}</span>
            </div>
            <div class="preview-item">
                <span>Total Games:</span>
                <span>${formatNumber(totalGames)}</span>
            </div>
            <div class="preview-item">
                <span>AI Types:</span>
                <span>${
                  Object.entries(distribution).filter(([_, count]) => count > 0)
                    .length
                } different</span>
            </div>
            <div class="preview-item">
                <span>Estimated Duration:</span>
                <span>${this.estimateDuration(totalGames)}</span>
            </div>
        `;
  }

  calculateAIDistribution() {
    const distribution = {
      easy: 0,
      medium: 0,
      hard: 0,
      random: 0,
      adaptive: 0,
    };

    if (this.currentDifficulty === "mixed") {
      // Mixed distribution - one of each difficulty up to enemy count
      const difficulties = ["easy", "medium", "hard", "random", "adaptive"];
      for (let i = 0; i < this.enemyCount; i++) {
        distribution[difficulties[i % difficulties.length]]++;
      }
    } else {
      // All enemies same difficulty
      distribution[this.currentDifficulty] = this.enemyCount;
    }

    return distribution;
  }

  calculateTotalGames(playerCount) {
    // Round robin: n*(n-1)/2 games
    return (playerCount * (playerCount - 1)) / 2;
  }

  estimateDuration(totalGames) {
    if (totalGames > 1000) {
      return "Very long - consider fewer players";
    }

    const minutes = Math.ceil(totalGames * 2); // ~2 minutes per game
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  attachLobbyEventListeners() {
    // Enemy count controls
    document
      .getElementById("decrease-enemies")
      .addEventListener("click", () => this.adjustEnemyCount(-1));
    document
      .getElementById("increase-enemies")
      .addEventListener("click", () => this.adjustEnemyCount(1));
    document
      .getElementById("enemy-count")
      .addEventListener("input", (e) => this.handleEnemyCountInput(e));
    document
      .getElementById("enemy-count")
      .addEventListener("change", (e) => this.handleEnemyCountChange(e));
    document
      .getElementById("enemy-count")
      .addEventListener("blur", (e) => this.validateEnemyCount(e));

    // Difficulty selection
    document.querySelectorAll('input[name="difficulty"]').forEach((radio) => {
      radio.addEventListener("change", (e) =>
        this.setDifficulty(e.target.value)
      );
    });

    // Action buttons
    document
      .getElementById("start-tournament")
      .addEventListener("click", () => this.startTournament());
    document
      .getElementById("view-leaderboard")
      .addEventListener("click", () => this.viewLeaderboard());
  }

  adjustEnemyCount(change) {
    const newCount = Math.max(
      this.MIN_ENEMIES,
      Math.min(this.MAX_ENEMIES, this.enemyCount + change)
    );
    this.setEnemyCount(newCount);
  }

  setEnemyCount(count) {
    // Ensure count is within bounds
    const validCount = Math.max(
      this.MIN_ENEMIES,
      Math.min(this.MAX_ENEMIES, count)
    );

    this.enemyCount = validCount;
    const enemyInput = document.getElementById("enemy-count");
    if (enemyInput) {
      enemyInput.value = validCount;
    }
    document.getElementById("ai-count").textContent = validCount;
    document.getElementById("total-players").textContent = validCount + 1;
    this.updateUI();
  }

  handleEnemyCountInput(e) {
    // Prevent non-numeric input
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }

  handleEnemyCountChange(e) {
    let value = parseInt(e.target.value);

    if (isNaN(value)) {
      // If not a number, reset to current count
      this.setEnemyCount(this.enemyCount);
      return;
    }

    this.setEnemyCount(value);
  }

  validateEnemyCount(e) {
    let value = parseInt(e.target.value);

    if (isNaN(value) || value < this.MIN_ENEMIES) {
      this.setEnemyCount(this.MIN_ENEMIES);
    } else if (value > this.MAX_ENEMIES) {
      this.setEnemyCount(this.MAX_ENEMIES);
    } else {
      this.setEnemyCount(value);
    }
  }

  setDifficulty(difficulty) {
    this.currentDifficulty = difficulty;
    document.querySelectorAll(".difficulty-option").forEach((option) => {
      option.classList.toggle(
        "selected",
        option.querySelector("input").value === difficulty
      );
    });
    document.getElementById("difficulty-description").textContent =
      this.difficultySettings[difficulty].description;
    this.updateUI();
  }

  updateUI() {
    document.getElementById("distribution-display").innerHTML =
      this.createDistributionDisplay();
    document.getElementById("tournament-preview").innerHTML =
      this.createTournamentPreview();
  }

  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  startTournament() {
    const enemyConfigs = this.generateEnemyConfigs();
    const event = new CustomEvent("tournamentStart", {
      detail: {
        enemyConfigs,
      },
    });
    document.dispatchEvent(event);
  }

  viewLeaderboard() {
    const event = new CustomEvent("showLeaderboard");
    document.dispatchEvent(event);
  }

  // In lobby.js - update generateEnemyConfigs method
  generateEnemyConfigs() {
    const distribution = this.calculateAIDistribution();
    const configs = [];

    // Map enemy types to your back design names
    const enemyTypeDesigns = {
      BeginnerEnemy: "easy",
      IntermediateEnemy: "intermediate",
      ExpertEnemy: "expert",
      RandomEnemy: "random",
      AdaptiveEnemy: "adaptive",
    };

    Object.entries(distribution).forEach(([difficulty, count]) => {
      for (let i = 1; i <= count; i++) {
        const enemyType = this.getEnemyType(difficulty);
        const cardDesign = enemyTypeDesigns[enemyType];

        configs.push({
          name: `${this.capitalizeFirst(difficulty)} AI ${i}`,
          difficulty: difficulty,
          type: enemyType,
          cardDesign: cardDesign,
        });
      }
    });

    return configs;
  }

  getEnemyType(difficulty) {
    const types = {
      easy: "BeginnerEnemy",
      medium: "IntermediateEnemy",
      hard: "ExpertEnemy",
      random: "RandomEnemy",
      adaptive: "AdaptiveEnemy",
    };
    return types[difficulty];
  }

  // New method to create actual enemy instances using the factory function
  createEnemyInstances() {
    const distribution = this.calculateAIDistribution();
    const enemies = [];

    Object.entries(distribution).forEach(([difficulty, count]) => {
      for (let i = 1; i <= count; i++) {
        const enemyType = this.getEnemyType(difficulty);
        const enemyName = `${this.capitalizeFirst(difficulty)} AI ${i}`;
        const enemy = createEnemy(enemyType, enemyName);
        enemies.push(enemy);
      }
    });

    return enemies;
  }
}
