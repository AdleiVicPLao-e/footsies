// src/lobby.js
import { createEnemy } from './enemy.js';

export class Lobby {
    constructor() {
        this.players = [];
        this.difficultySettings = {
            'easy': { weight: 1, description: 'Beginner - Hits until 16' },
            'medium': { weight: 2, description: 'Intermediate - Balanced play' },
            'hard': { weight: 3, description: 'Expert - Uses strategy tables' },
            'random': { weight: 1.5, description: 'Wild - Unpredictable' },
            'adaptive': { weight: 2.5, description: 'Custom - Learns from you' }
        };
        this.currentDifficulty = 'medium';
        this.enemyCount = 3;
    }

    initializeLobbyUI() {
        const app = document.getElementById('app');
        app.innerHTML = this.createLobbyHTML();
        this.attachLobbyEventListeners();
    }

    createLobbyHTML() {
        return `
            <div class="lobby-container">
                <header class="lobby-header">
                    <h1>🎮 Blackjack Tournament Lobby</h1>
                    <p class="subtitle">Configure your tournament settings</p>
                </header>

                <div class="lobby-content">
                    <div class="settings-panel">
                        <div class="setting-group">
                            <label for="enemy-count" class="setting-label">Number of AI Players:</label>
                            <div class="input-group">
                                <button class="btn-stepper" id="decrease-enemies">-</button>
                                <input type="number" id="enemy-count" class="number-input" value="3" min="1" max="8">
                                <button class="btn-stepper" id="increase-enemies">+</button>
                            </div>
                            <span class="setting-description">Total players: <span id="total-players">4</span> (You + <span id="ai-count">3</span> AI)</span>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Tournament Difficulty:</label>
                            <div class="difficulty-options" id="difficulty-options">
                                ${this.createDifficultyOptions()}
                            </div>
                            <span class="setting-description" id="difficulty-description">Intermediate - Balanced play</span>
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
        return difficulties.map(diff => `
            <label class="difficulty-option ${diff === this.currentDifficulty ? 'selected' : ''}">
                <input type="radio" name="difficulty" value="${diff}" ${diff === this.currentDifficulty ? 'checked' : ''}>
                <span class="difficulty-badge difficulty-${diff}">
                    ${this.capitalizeFirst(diff)}
                </span>
            </label>
        `).join('');
    }

    createDistributionDisplay() {
        const distribution = this.calculateAIDistribution();
        return Object.entries(distribution).map(([diff, count]) => 
            count > 0 ? `<span class="distribution-item difficulty-${diff}">${count} ${this.capitalizeFirst(diff)}</span>` : ''
        ).join('');
    }

    createTournamentPreview() {
        const distribution = this.calculateAIDistribution();
        const totalGames = this.calculateTotalGames(this.enemyCount + 1);
        
        return `
            <div class="preview-item">
                <span>Total Players:</span>
                <span>${this.enemyCount + 1}</span>
            </div>
            <div class="preview-item">
                <span>Total Games:</span>
                <span>${totalGames}</span>
            </div>
            <div class="preview-item">
                <span>AI Types:</span>
                <span>${Object.entries(distribution).filter(([_, count]) => count > 0).length} different</span>
            </div>
            <div class="preview-item">
                <span>Estimated Duration:</span>
                <span>${this.estimateDuration(totalGames)}</span>
            </div>
        `;
    }

    calculateAIDistribution() {
        const distribution = {
            'easy': 0,
            'medium': 0,
            'hard': 0,
            'random': 0,
            'adaptive': 0
        };

        if (this.currentDifficulty === 'mixed') {
            // Mixed distribution - one of each difficulty up to enemy count
            const difficulties = ['easy', 'medium', 'hard', 'random', 'adaptive'];
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
        const minutes = Math.ceil(totalGames * 2); // ~2 minutes per game
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }

    attachLobbyEventListeners() {
        // Enemy count controls
        document.getElementById('decrease-enemies').addEventListener('click', () => this.adjustEnemyCount(-1));
        document.getElementById('increase-enemies').addEventListener('click', () => this.adjustEnemyCount(1));
        document.getElementById('enemy-count').addEventListener('change', (e) => this.setEnemyCount(parseInt(e.target.value)));

        // Difficulty selection
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.setDifficulty(e.target.value));
        });

        // Action buttons
        document.getElementById('start-tournament').addEventListener('click', () => this.startTournament());
        document.getElementById('view-leaderboard').addEventListener('click', () => this.viewLeaderboard());
    }

    adjustEnemyCount(change) {
        const newCount = Math.max(1, Math.min(8, this.enemyCount + change));
        this.setEnemyCount(newCount);
    }

    setEnemyCount(count) {
        this.enemyCount = count;
        document.getElementById('enemy-count').value = count;
        document.getElementById('ai-count').textContent = count;
        document.getElementById('total-players').textContent = count + 1;
        this.updateUI();
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.toggle('selected', option.querySelector('input').value === difficulty);
        });
        document.getElementById('difficulty-description').textContent = 
            this.difficultySettings[difficulty].description;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('distribution-display').innerHTML = this.createDistributionDisplay();
        document.getElementById('tournament-preview').innerHTML = this.createTournamentPreview();
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    startTournament() {
        const enemyConfigs = this.generateEnemyConfigs();
        const event = new CustomEvent('tournamentStart', {
            detail: { enemyConfigs }
        });
        document.dispatchEvent(event);
    }

    viewLeaderboard() {
        const event = new CustomEvent('showLeaderboard');
        document.dispatchEvent(event);
    }

    generateEnemyConfigs() {
        const distribution = this.calculateAIDistribution();
        const configs = [];

        Object.entries(distribution).forEach(([difficulty, count]) => {
            for (let i = 1; i <= count; i++) {
                configs.push({
                    name: `${this.capitalizeFirst(difficulty)} AI ${i}`,
                    difficulty: difficulty,
                    type: this.getEnemyType(difficulty)
                });
            }
        });

        return configs;
    }

    getEnemyType(difficulty) {
        const types = {
            'easy': 'BeginnerEnemy',
            'medium': 'IntermediateEnemy',
            'hard': 'ExpertEnemy',
            'random': 'RandomEnemy',
            'adaptive': 'AdaptiveEnemy'
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