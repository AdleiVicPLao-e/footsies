// main.js
import { GameRoom } from './gameRoom.js';
import { Lobby } from './lobby.js';
import { Leaderboard } from './leaderboards.js';
import { DOMBuilder } from './domBuilder.js';
import { createEnemy } from './enemy.js';

class BlackjackApp {
    constructor() {
        this.lobby = new Lobby();
        this.leaderboard = new Leaderboard();
        this.gameRoom = null;
        this.currentView = 'lobby'; // 'lobby', 'game', 'leaderboard'
        this.tournamentStartTime = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.showLobby();
    }
    
    setupEventListeners() {
        document.addEventListener('tournamentStart', (e) => this.startTournament(e.detail.enemyConfigs));
        document.addEventListener('showLeaderboard', () => this.showLeaderboard());
        document.addEventListener('showLobby', () => this.showLobby());
    }
    
    showLobby() {
        this.currentView = 'lobby';
        this.lobby.initializeLobbyUI();
    }
    
    showLeaderboard() {
        this.currentView = 'leaderboard';
        this.leaderboard.initializeLeaderboardUI();
    }
    
    startTournament(enemyConfigs) {
    this.currentView = 'game';
    this.tournamentStartTime = Date.now();
    this.gameRoom = new GameRoom();
    
    // Add human player
    this.gameRoom.addPlayer("You");
    
    // Add AI players based on config
    enemyConfigs.forEach(config => {
        const enemy = createEnemy(config.type, config.name);
        this.gameRoom.addEnemy(enemy);
    });
    
    // Start tournament
    this.gameRoom.startRoundRobin();
    
    // Initialize game UI
    DOMBuilder.initializeGameUI();
    this.attachGameEventListeners();
    this.startCurrentGame();
}

    attachGameEventListeners() {
        document.getElementById('hit-btn').addEventListener('click', () => this.playerHit());
        document.getElementById('stand-btn').addEventListener('click', () => this.playerStand());
        document.getElementById('next-btn').addEventListener('click', () => this.nextGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetTournament());
        document.getElementById('lobby-btn').addEventListener('click', () => this.returnToLobby());
    }
    
    startCurrentGame() {
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    
    // Set up the UI update callback
    currentGame.setOnStateChange(() => {
        this.updateUI();
    });
    
    console.log(`Starting game: ${currentGame.player1.name} vs ${currentGame.player2.name}`);
    this.updateUI(); // Force initial UI update
}
    
    playerHit() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        currentGame.hit();
        this.updateUI();
        
        if (currentGame.gameOver) {
            this.handleGameEnd();
        }
    }
    
    playerStand() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        currentGame.stand();
        this.updateUI();
        
        if (currentGame.gameOver) {
            this.handleGameEnd();
        }
    }
    
    nextGame() {
        if (this.gameRoom.nextGame()) {
            this.startCurrentGame();
        } else {
            this.endTournament();
        }
    }
    
    resetTournament() {
        if (confirm('Are you sure you want to reset the current tournament? All progress will be lost.')) {
            this.gameRoom = new GameRoom();
            this.setupGameFromCurrentConfig();
        }
    }
    
    returnToLobby() {
        if (this.gameRoom && this.gameRoom.games.length > 0) {
            if (confirm('Return to lobby? Current tournament progress will be lost.')) {
                this.showLobby();
            }
        } else {
            this.showLobby();
        }
    }
    
    setupGameFromCurrentConfig() {
        // This would use the current enemy configs, but for now we'll restart with default
        this.startCurrentGame();
    }
    
    handleGameEnd() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        
        // Record the winner
        this.gameRoom.recordWin(currentGame.winner?.name);
        
        // Enable next game button
        document.getElementById('next-btn').disabled = false;
        
        // Auto-advance after delay if it's AI vs AI
        if (!currentGame.player1.isHuman && !currentGame.player2.isHuman) {
            setTimeout(() => {
                if (this.gameRoom.nextGame()) {
                    this.startCurrentGame();
                } else {
                    this.endTournament();
                }
            }, 2000);
        }
    }
    
    endTournament() {
        const leaderboard = this.gameRoom.getLeaderboard();
        const tournamentDuration = Math.round((Date.now() - this.tournamentStartTime) / 1000 / 60); // minutes
        
        console.log("Tournament ended! Final leaderboard:", leaderboard);
        
        // Save to leaderboard
        this.leaderboard.addEntry({
            playerName: "You",
            score: this.gameRoom.scores.get("You") || 0,
            difficulty: this.lobby.currentDifficulty,
            playerCount: this.gameRoom.players.length,
            duration: `${tournamentDuration}m`,
            wins: this.gameRoom.scores.get("You") || 0,
            totalGames: this.gameRoom.games.length
        });
        
        // Show tournament results
        const statusElem = document.getElementById('status-message');
        const winnerName = leaderboard[0][0];
        statusElem.textContent = winnerName === "You" 
            ? `🎉 You win the tournament! 🎉` 
            : `Tournament Over! Winner: ${winnerName}`;
        statusElem.className = 'status-message status-game-over';
        
        // Show celebration for human win
        if (winnerName === "You") {
            this.showCelebration();
        }
    }
    
    showCelebration() {
        const statusElem = document.getElementById('status-message');
        statusElem.style.animation = 'celebrate 2s ease-in-out';
        
        // Add some visual celebration
        setTimeout(() => {
            statusElem.style.animation = '';
        }, 2000);
    }
    
    updateUI() {
    if (this.currentView !== 'game') return;
    
    try {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        this.updatePlayers(currentGame);
        this.updateControls(currentGame);
        this.updateGameInfo(currentGame);
        this.updateLeaderboard();
        this.updateTournamentProgress();
        
        // Auto-play AI turns with proper checks
        if (!currentGame.gameOver && 
            !currentGame.currentPlayer.isHuman && 
            !currentGame.processingAITurn &&
            !currentGame.currentPlayer.isStanding) {
            setTimeout(() => this.playAITurn(), 1000);
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}
    
    updatePlayers(game) {
    // Update player 1
    const player1Elem = document.getElementById('player1');
    const player2Elem = document.getElementById('player2');
    
    // Update names
    player1Elem.querySelector('.player-name').textContent = game.player1.name;
    player2Elem.querySelector('.player-name').textContent = game.player2.name;
    
    // Update scores
    document.getElementById('player1-score').textContent = game.player1.score;
    
    // Update enemy score display with special formatting
    const enemyScoreElem = document.getElementById('player2-score');
    if (!game.player2.isHuman) {
        enemyScoreElem.textContent = game.getEnemyScoreForDisplay();
        // Add a class for styling when score is partial
        if (!game.shouldShowEnemyCards()) {
            enemyScoreElem.classList.add('partial-score');
        } else {
            enemyScoreElem.classList.remove('partial-score');
        }
    } else {
        enemyScoreElem.textContent = game.player2.score;
        enemyScoreElem.classList.remove('partial-score');
    }
    
    // Update active player
    player1Elem.classList.toggle('active', game.currentPlayer === game.player1);
    player2Elem.classList.toggle('active', game.currentPlayer === game.player2);
    
    // Update player types
    player1Elem.classList.toggle('human', game.player1.isHuman);
    player1Elem.classList.toggle('enemy', !game.player1.isHuman);
    player2Elem.classList.toggle('human', game.player2.isHuman);
    player2Elem.classList.toggle('enemy', !game.player2.isHuman);
    
    // Update bust status
    player1Elem.classList.toggle('player-bust', game.player1.score > 21);
    player2Elem.classList.toggle('player-bust', game.player2.score > 21);
    
    // Update winner status
    player1Elem.classList.toggle('player-winner', game.winner === game.player1);
    player2Elem.classList.toggle('player-winner', game.winner === game.player2);
    
    // Update cards display with enemy handling
    this.renderCards('player1-cards', game.player1.hand, false);
    this.renderCards('player2-cards', game.player2.hand, true); // Pass true for enemy
}
    
    renderCards(containerId, hand, isEnemy = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    
    if (isEnemy && containerId === 'player2-cards') {
        // Use the special method for enemy hand display
        const displayHand = currentGame.getEnemyHandForDisplay();
        displayHand.forEach((card, index) => {
            const isFaceUp = !card.isHidden;
            const cardElem = DOMBuilder.createCardElement(card, isFaceUp);
            container.appendChild(cardElem);
        });
    } else {
        // Regular display for human player
        hand.forEach(card => {
            const cardElem = DOMBuilder.createCardElement(card, true);
            container.appendChild(cardElem);
        });
    }
}
    
    updateControls(game) {
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const nextBtn = document.getElementById('next-btn');
        
        const isHumanTurn = game.currentPlayer.isHuman;
        const gameOver = game.gameOver;
        
        hitBtn.disabled = !isHumanTurn || gameOver;
        standBtn.disabled = !isHumanTurn || gameOver;
        nextBtn.disabled = !gameOver;
        
        // Show/hide lobby button based on game state
        const lobbyBtn = document.getElementById('lobby-btn');
        lobbyBtn.style.display = gameOver ? 'inline-block' : 'none';
    }
    
    updateGameInfo(game) {
        document.getElementById('current-player').textContent = game.currentPlayer.name;
        document.getElementById('game-status').textContent = game.gameOver ? 'Game Over' : 'Active';
        document.getElementById('deck-count').textContent = game.deck.cards.length;
        
        // Update status message
        const statusElem = document.getElementById('status-message');
        statusElem.className = 'status-message';
        
        if (game.gameOver) {
            if (game.winner) {
                statusElem.textContent = `${game.winner.name} wins with ${game.winner.score}!`;
            } else {
                statusElem.textContent = "It's a tie!";
            }
            statusElem.classList.add('status-game-over');
        } else if (game.currentPlayer.isHuman) {
            statusElem.textContent = 'Your turn! Choose to Hit or Stand.';
            statusElem.classList.add('status-player-turn');
        } else {
            statusElem.textContent = `${game.currentPlayer.name} is thinking...`;
            statusElem.classList.add('status-enemy-turn');
        }
    }
    
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        const leaderboard = this.gameRoom.getLeaderboard();
        
        leaderboardList.innerHTML = '';
        leaderboard.forEach(([name, score], index) => {
            const item = document.createElement('li');
            item.className = 'leaderboard-item';
            
            // Add special class for human player
            if (name === "You") {
                item.classList.add('current-player');
            }
            
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${name}</span>
                <span class="leaderboard-score">${score}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }
    
    updateTournamentProgress() {
        const totalGames = this.gameRoom.games.length;
        const currentGame = this.gameRoom.currentGameIndex + 1;
        const progress = (currentGame / totalGames) * 100;
        
        document.getElementById('game-count').textContent = `Game ${currentGame} of ${totalGames}`;
        document.getElementById('games-played').textContent = `${currentGame - 1}/${totalGames}`;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }
    
    // In main.js - update the playAITurn method
playAITurn() {
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    
    if (!currentGame.gameOver && !currentGame.currentPlayer.isHuman && !currentGame.processingAITurn) {
        console.log(`AI ${currentGame.currentPlayer.name} taking turn`);
        currentGame.handleAITurn();
    }
}

// Also update the updateUI method to be more careful about AI turns
updateUI() {
    if (this.currentView !== 'game') return;
    
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    this.updatePlayers(currentGame);
    this.updateControls(currentGame);
    this.updateGameInfo(currentGame);
    this.updateLeaderboard();
    this.updateTournamentProgress();
    
    // Auto-play AI turns with proper checks
    if (!currentGame.gameOver && 
        !currentGame.currentPlayer.isHuman && 
        !currentGame.processingAITurn &&
        !currentGame.currentPlayer.isStanding) {
        setTimeout(() => this.playAITurn(), 1000);
    }
}
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BlackjackApp();
});