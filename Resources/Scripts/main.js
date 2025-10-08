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
        this.lastGameState = {}; // Add this line
        
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
    
    // main.js - update startTournament method
startTournament(enemyConfigs) {
    this.currentView = 'game';
    this.tournamentStartTime = Date.now();
    this.gameRoom = new GameRoom();
    
    // Add human player with player card design
    this.gameRoom.addPlayer("You", 'player');
    
    // Add AI players with their designs from config
    enemyConfigs.forEach(config => {
        const enemy = createEnemy(config.type, config.name, config.cardDesign);
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
        document.getElementById('lobby-btn').addEventListener('click', () => this.returnToLobby());
    }
    
    startCurrentGame() {
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    
    // Set up the UI update callback
    currentGame.setOnStateChange(() => {
        this.updateUI();
    });
    
    // Set up the game end callback
    currentGame.setOnGameEnd((winner) => {
        console.log('Game end callback triggered, winner:', winner?.name);
        this.handleGameEnd();
    });
    
    console.log(`Starting game: ${currentGame.player1.name} vs ${currentGame.player2.name}`);
    this.updateUI(); // Force initial UI update
}
    
    playerHit() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        
        // Only allow hitting if it's human's turn AND it's not AI vs AI
        if (currentGame.currentPlayer.isHuman && !currentGame.isAIVsAI) {
            currentGame.hit();
            this.updateUI();
        }
    }
    
    playerStand() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        
        // Only allow standing if it's human's turn AND it's not AI vs AI
        if (currentGame.currentPlayer.isHuman && !currentGame.isAIVsAI) {
            currentGame.stand();
            this.updateUI();
        }
    }
    
    nextGame() {
        if (this.gameRoom.nextGame()) {
            this.startCurrentGame();
        } else {
            this.endTournament();
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
        this.startCurrentGame();
    }
    
    // In main.js - update the handleGameEnd method
handleGameEnd() {
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    
    // Debug: Check game state before recording
    console.log('=== GAME END DEBUG ===');
    console.log('Game over - winner:', currentGame.winner);
    console.log('Game over - winner name:', currentGame.winner?.name);
    console.log('Game over - player1:', currentGame.player1.name, 'score:', currentGame.player1.score);
    console.log('Game over - player2:', currentGame.player2.name, 'score:', currentGame.player2.score);
    console.log('Scores before recording:', Array.from(this.gameRoom.scores.entries()));
    
    // Record the winner
    if (currentGame.winner) {
        const winnerName = currentGame.winner.name;
        console.log(`Recording win for: ${winnerName}`);
        
        // Get current score before updating
        const currentScore = this.gameRoom.scores.get(winnerName) || 0;
        console.log(`Current score for ${winnerName}: ${currentScore}`);
        
        this.gameRoom.recordWin(winnerName);
        
        // Debug: Check scores after recording
        const newScore = this.gameRoom.scores.get(winnerName);
        console.log(`New score for ${winnerName}: ${newScore}`);
        console.log('Scores after recording:', Array.from(this.gameRoom.scores.entries()));
    } else {
        console.log("Game ended in tie, no winner recorded");
    }
    
    console.log('=== END DEBUG ===');
    
    // Update the sidebar leaderboard immediately
    this.updateLeaderboard();
    
    // Enable next game button only if it's NOT AI vs AI
    document.getElementById('next-btn').disabled = currentGame.isAIVsAI;
    
    // Auto-advance after delay if it's AI vs AI
    if (currentGame.isAIVsAI) {
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
    const tournamentDuration = Math.round((Date.now() - this.tournamentStartTime) / 1000 / 60);
    
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
    
    // Enable the next game button and change its text
    const nextBtn = document.getElementById('next-btn');
    nextBtn.disabled = false;
    nextBtn.textContent = 'View Leaderboard';
    
    // Remove existing event listeners and add new one
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    document.getElementById('next-btn').addEventListener('click', () => this.showLeaderboard());
    
    // Update the sidebar leaderboard one last time with final results
    this.updateLeaderboard();
}
    
    showCelebration() {
        const statusElem = document.getElementById('status-message');
        statusElem.style.animation = 'celebrate 2s ease-in-out';
        
        setTimeout(() => {
            statusElem.style.animation = '';
        }, 2000);
    }
    
    updateUI() {
    if (this.currentView !== 'game') return;
    
    try {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        if (!currentGame) {
            console.log('No current game found');
            return;
        }
        
        // Check if required DOM elements exist
        if (!document.getElementById('players-container')) {
            console.error('Game UI not properly initialized');
            return;
        }
        
        this.updatePlayers(currentGame);
        this.updateControls(currentGame);
        this.updateGameInfo(currentGame);
        this.updateLeaderboard();
        this.updateTournamentProgress();
        
        // Only auto-play if it's human vs AI and it's AI's turn
        if (!currentGame.gameOver && 
            !currentGame.currentPlayer.isHuman && 
            !currentGame.processingAITurn &&
            !currentGame.currentPlayer.isStanding &&
            !currentGame.isAIVsAI) {
            setTimeout(() => this.playAITurn(), 1000);
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}
    
    // In main.js - update the updatePlayers method
updatePlayers(game) {
    // Update player 1
    const player1Elem = document.getElementById('player1');
    const player2Elem = document.getElementById('player2');
    
    // Update names
    player1Elem.querySelector('.player-name').textContent = game.player1.name;
    player2Elem.querySelector('.player-name').textContent = game.player2.name;
    
    // Set data attributes for CSS styling
    if (!game.player1.isHuman && game.player1.difficulty) {
        player1Elem.setAttribute('data-difficulty', game.player1.difficulty);
    } else {
        player1Elem.removeAttribute('data-difficulty');
    }
    
    if (!game.player2.isHuman && game.player2.difficulty) {
        player2Elem.setAttribute('data-difficulty', game.player2.difficulty);
    } else {
        player2Elem.removeAttribute('data-difficulty');
    }
    
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
    
    // In main.js - update the renderCards method
renderCards(containerId, hand, isEnemy = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
    const playerId = containerId.replace('-cards', '');
    
    // Determine which player this container belongs to and get their card design
    let player, cardDesign;
    
    if (playerId === 'player1') {
        player = currentGame.player1;
    } else if (playerId === 'player2') {
        player = currentGame.player2;
    }
    
    cardDesign = player.cardDesign || 'player'; // Get the player's card design
    
    if (isEnemy && containerId === 'player2-cards') {
        // Use the special method for enemy hand display
        const displayHand = currentGame.getEnemyHandForDisplay();
        displayHand.forEach((card, index) => {
            const isFaceUp = !card.isHidden;
            // Pass the card design to createCardElement
            const cardElem = DOMBuilder.createCardElement(card, isFaceUp, cardDesign);
            container.appendChild(cardElem);
        });
    } else {
        // Regular display for human player
        hand.forEach(card => {
            // Pass the card design to createCardElement
            const cardElem = DOMBuilder.createCardElement(card, true, cardDesign);
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
    const isAIVsAI = game.isAIVsAI;
    
    // In AI vs AI games, disable ALL player controls
    if (isAIVsAI) {
        hitBtn.disabled = true;
        standBtn.disabled = true;
        nextBtn.disabled = true; // Disable next button in AI vs AI
        hitBtn.title = 'AI vs AI - Auto-advancing';
        standBtn.title = 'AI vs AI - Auto-advancing';
        nextBtn.title = 'AI vs AI - Auto-advancing';
    } else {
        // Normal human-involved game
        hitBtn.disabled = !isHumanTurn || gameOver;
        standBtn.disabled = !isHumanTurn || gameOver;
        nextBtn.disabled = !gameOver; // Enable next button when game over in human games
        hitBtn.title = '';
        standBtn.title = '';
        nextBtn.title = '';
    }
    
    // Show/hide lobby button based on game state
    const lobbyBtn = document.getElementById('lobby-btn');
    lobbyBtn.style.display = gameOver ? 'inline-block' : 'none';
}
    
    updateGameInfo(game) {
    const currentPlayerElem = document.getElementById('current-player');
    const gameStatusElem = document.getElementById('game-status');
    const deckCountElem = document.getElementById('deck-count');
    const gameTypeElem = document.getElementById('game-type');

    if (currentPlayerElem) currentPlayerElem.textContent = game.currentPlayer.name;
    
    let statusText = game.gameOver ? 'Game Over' : 'Active';
    let statusClass = 'text-success';
    
    if (game.isAIVsAI) {
        if (game.gameOver) {
            statusText = 'AI vs AI - Auto-advancing';
            statusClass = 'text-warning';
        } else {
            statusText = 'AI vs AI - Watching';
            statusClass = 'text-warning';
        }
    } else if (game.gameOver) {
        statusClass = 'text-info';
    }
    
    if (gameStatusElem) {
        gameStatusElem.textContent = statusText;
        gameStatusElem.className = `info-value ${statusClass}`;
    }
    
    if (deckCountElem) deckCountElem.textContent = game.deck.cards.length;
    
    // Update game type
    let gameType = 'Human vs AI';
    if (game.isAIVsAI) {
        gameType = 'AI vs AI (Auto)';
    } else if (game.player1.isHuman && game.player2.isHuman) {
        gameType = 'Human vs Human';
    }
    
    if (gameTypeElem) gameTypeElem.textContent = gameType;

    // Update status message
    const statusElem = document.getElementById('status-message');
    if (statusElem) {
        statusElem.className = 'status-message';
        
        if (game.gameOver) {
            if (game.winner) {
                statusElem.textContent = `${game.winner.name} wins with ${game.winner.score}!`;
            } else {
                statusElem.textContent = "It's a tie!";
            }
            
            if (game.isAIVsAI) {
                statusElem.textContent += ' - Auto-advancing...';
                statusElem.classList.add('status-waiting');
            } else {
                statusElem.classList.add('status-game-over');
            }
        } else if (game.isAIVsAI) {
            statusElem.textContent = `Watching: ${game.player1.name} vs ${game.player2.name}`;
            statusElem.classList.add('status-waiting');
        } else if (game.currentPlayer.isHuman) {
            statusElem.textContent = 'Your turn! Choose to Hit or Stand.';
            statusElem.classList.add('status-player-turn');
        } else {
            statusElem.textContent = `${game.currentPlayer.name} is thinking...`;
            statusElem.classList.add('status-enemy-turn');
        }
    }
}
    
    updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) {
        console.log('Leaderboard list element not found in current view');
        return;
    }
    
    // Debug: Check current scores
    console.log('Current scores object:', this.gameRoom.scores);
    console.log('Scores entries:', Array.from(this.gameRoom.scores.entries()));
    
    const leaderboard = this.gameRoom.getLeaderboard();
    console.log('Leaderboard array:', leaderboard);
    
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'leaderboard-item';
        emptyItem.innerHTML = `
            <span class="leaderboard-rank">-</span>
            <span class="leaderboard-name">No games played yet</span>
            <span class="leaderboard-score">0</span>
        `;
        leaderboardList.appendChild(emptyItem);
        return;
    }
    
    leaderboard.forEach(([name, score], index) => {
        const item = document.createElement('li');
        item.className = 'leaderboard-item';
        
        // Add special class for human player
        if (name === "You") {
            item.classList.add('current-player');
        }
        
        // Add medal emojis for top 3
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        
        item.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${name} ${medal}</span>
            <span class="leaderboard-score">${score}</span>
        `;
        leaderboardList.appendChild(item);
    });
}
    
    updateTournamentProgress() {
    const totalGames = this.gameRoom.games.length;
    const currentGame = this.gameRoom.currentGameIndex + 1;
    
    // Update games played
    const gamesPlayedElem = document.getElementById('games-played');
    if (gamesPlayedElem) {
        gamesPlayedElem.textContent = `${currentGame - 1}/${totalGames}`;
    }
    
    // Update game count and progress bar
    const gameCountElem = document.getElementById('game-count');
    const progressFillElem = document.getElementById('progress-fill');
    
    if (gameCountElem) {
        gameCountElem.textContent = `Game ${currentGame} of ${totalGames}`;
    }
    
    if (progressFillElem) {
        const progress = (currentGame / totalGames) * 100;
        progressFillElem.style.width = `${progress}%`;
    }
}
    
    playAITurn() {
        const currentGame = this.gameRoom.games[this.gameRoom.currentGameIndex];
        
        if (!currentGame || 
            currentGame.gameOver || 
            currentGame.currentPlayer.isHuman || 
            currentGame.processingAITurn ||
            currentGame.currentPlayer.isStanding) {
            return;
        }
        
        console.log(`AI ${currentGame.currentPlayer.name} taking turn`);
        currentGame.handleAITurn();
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BlackjackApp();
});