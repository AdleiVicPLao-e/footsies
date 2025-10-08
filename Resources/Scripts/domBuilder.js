// domBuilder.js
export class DOMBuilder {
    static initializeApp() {
        // This is now handled by the main app switching between views
    }

    static initializeGameUI() {
        const app = document.getElementById('app');
        app.innerHTML = this.createGameHTML();
        this.initializeGameInfo();
    }

    static createGameHTML() {
        return `
            <div class="container">
                <header class="header">
                    <h1>♠️ Blackjack Tournament ♣️</h1>
                    <p class="subtitle">Round Robin Championship</p>
                </header>

                <div class="game-layout">
                    <div class="game-area">
                        <div class="tournament-progress">
                            <div class="progress-header">
                                <span>Tournament Progress</span>
                                <span id="game-count">Game 1 of 6</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: 16.66%"></div>
                            </div>
                        </div>
                        
                        <div class="players-container" id="players-container">
                            ${this.createPlayerElement('player1', 'Player 1', true)}
                            ${this.createPlayerElement('player2', 'AI Player 1', false)}
                        </div>
                        
                        <div class="status-message status-player-turn" id="status-message">
                            Your turn! Choose to Hit or Stand.
                        </div>
                        
                        <div class="controls">
                            <h3>Game Controls</h3>
                            <div class="buttons-container" id="buttons-container">
                                <!-- Buttons will be added by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="sidebar">
                        <div class="game-info">
                            <h3>Game Info</h3>
                            <div class="info-list" id="game-info-list">
                                <!-- Info items will be added by JavaScript -->
                            </div>
                        </div>
                        
                        <div class="leaderboard">
                            <h3>🏆 Current Standings</h3>
                            <div class="tournament-leaderboard">
                                <ul class="leaderboard-list" id="leaderboard-list"></ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static createPlayerElement(id, name, isHuman) {
        return `
            <div class="player ${isHuman ? 'human' : 'enemy'}" id="${id}">
                <div class="player-header">
                    <span class="player-name">${name}</span>
                    <span class="player-score" id="${id}-score">0</span>
                </div>
                <div class="cards-container" id="${id}-cards"></div>
            </div>
        `;
    }

    static initializeGameInfo() {
        const gameInfoList = document.getElementById('game-info-list');
        if (!gameInfoList) {
            console.error('Game info list element not found!');
            return;
        }
        
        gameInfoList.innerHTML = `
            <div class="info-item">
                <span class="info-label">Current Player:</span>
                <span class="info-value" id="current-player">Player 1</span>
            </div>
            <div class="info-item">
                <span class="info-label">Games Played:</span>
                <span class="info-value" id="games-played">0/6</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value text-success" id="game-status">Active</span>
            </div>
            <div class="info-item">
                <span class="info-label">Deck Cards:</span>
                <span class="info-value" id="deck-count">52</span>
            </div>
            <div class="info-item">
                <span class="info-label">Game Type:</span>
                <span class="info-value" id="game-type">Human vs AI</span>
            </div>
        `;

        // Add buttons dynamically
        const buttonsContainer = document.getElementById('buttons-container');
        if (!buttonsContainer) {
            console.error('Buttons container not found!');
            return;
        }
        
        buttonsContainer.innerHTML = ''; // Clear existing buttons
        
        buttonsContainer.appendChild(this.createButton('hit-btn', 'Hit', 'btn btn-hit'));
        buttonsContainer.appendChild(this.createButton('stand-btn', 'Stand', 'btn btn-stand'));
        buttonsContainer.appendChild(this.createButton('next-btn', 'Next Game', 'btn btn-next'));
        buttonsContainer.appendChild(this.createButton('lobby-btn', 'Back to Lobby', 'btn btn-secondary'));
    }

    static createButton(id, text, className) {
        const button = document.createElement('button');
        button.id = id;
        button.className = className;
        button.textContent = text;
        return button;
    }

    static createCardElement(card, isFaceUp = true, backDesign = 'player') {
        const cardElem = document.createElement('div');
        cardElem.className = 'card-img-container card-dealing';
        
        const img = document.createElement('img');
        img.alt = isFaceUp && !card.isHidden ? card.toString() : 'Card Back';
        img.className = 'card-image';
        
        if (isFaceUp && !card.isHidden) {
            img.src = card.imagePath;
            img.onerror = () => {
                console.warn(`Card image not found: ${card.imagePath}, using fallback`);
                this.createFallbackCard(cardElem, card, true);
            };
        } else {
            // Use the new naming convention for card backs
            img.src = this.getBackImagePath(backDesign);
            img.onerror = () => {
                console.warn(`Card back image not found for design: ${backDesign}, using fallback`);
                this.createFallbackCard(cardElem, card, false);
            };
        }
        
        cardElem.appendChild(img);
        return cardElem;
    }

    static getBackImagePath(backDesign = 'player') {
        // Map the back design names to your file names
        const backDesignMap = {
            'player': 'back_player',
            'easy': 'back_easy',
            'intermediate': 'back_intermediate',
            'expert': 'back_expert',
            'random': 'back_random',
            'adaptive': 'back_adaptive'
        };
        
        const fileName = backDesignMap[backDesign] || 'back_player';
        return `./Resources/Assets/Images/Cards/${fileName}.png`;
    }

    static createFallbackCard(container, card, isFaceUp) {
        // Fallback to CSS cards if images don't load
        container.innerHTML = '';
        const fallbackCard = document.createElement('div');
        
        if (isFaceUp) {
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
            fallbackCard.className = `card ${isRed ? 'red' : 'black'} card-dealing`;
            fallbackCard.innerHTML = `
                <div class="card-top">
                    <div>${card.rank}</div>
                    <div>${this.getSuitSymbol(card.suit)}</div>
                </div>
                <div class="card-center">${this.getSuitSymbol(card.suit)}</div>
                <div class="card-bottom">
                    <div>${card.rank}</div>
                    <div>${this.getSuitSymbol(card.suit)}</div>
                </div>
            `;
        } else {
            fallbackCard.className = 'card card-back card-dealing';
            fallbackCard.innerHTML = `<div class="card-hidden">?</div>`;
        }
        
        container.appendChild(fallbackCard);
    }

    static getSuitSymbol(suit) {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[suit] || suit;
    }

    // New method to update game info dynamically
    static updateGameInfo(currentPlayer, gameStatus, deckCount, gameType = 'Human vs AI') {
        const currentPlayerElem = document.getElementById('current-player');
        const gameStatusElem = document.getElementById('game-status');
        const deckCountElem = document.getElementById('deck-count');
        const gameTypeElem = document.getElementById('game-type');

        if (currentPlayerElem) currentPlayerElem.textContent = currentPlayer;
        if (gameStatusElem) gameStatusElem.textContent = gameStatus;
        if (deckCountElem) deckCountElem.textContent = deckCount;
        if (gameTypeElem) gameTypeElem.textContent = gameType;
    }

    // New method to update games played
    static updateGamesPlayed(currentGame, totalGames) {
        const gamesPlayedElem = document.getElementById('games-played');
        if (gamesPlayedElem) {
            gamesPlayedElem.textContent = `${currentGame - 1}/${totalGames}`;
        }
    }

    // New method to update tournament progress
    static updateTournamentProgress(currentGame, totalGames) {
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
}