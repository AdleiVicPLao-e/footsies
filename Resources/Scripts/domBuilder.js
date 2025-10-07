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
                            <ul class="leaderboard-list" id="leaderboard-list"></ul>
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
        `;

        // Add buttons dynamically
        const buttonsContainer = document.getElementById('buttons-container');
        buttonsContainer.innerHTML = ''; // Clear existing buttons
        
        buttonsContainer.appendChild(this.createButton('hit-btn', 'Hit', 'btn btn-hit'));
        buttonsContainer.appendChild(this.createButton('stand-btn', 'Stand', 'btn btn-stand'));
        buttonsContainer.appendChild(this.createButton('next-btn', 'Next Game', 'btn btn-next'));
        buttonsContainer.appendChild(this.createButton('reset-btn', 'Reset Tournament', 'btn btn-reset'));
        buttonsContainer.appendChild(this.createButton('lobby-btn', 'Back to Lobby', 'btn btn-secondary'));
    }

    static createButton(id, text, className) {
        const button = document.createElement('button');
        button.id = id;
        button.className = className;
        button.textContent = text;
        return button;
    }

    static createCardElement(card, isFaceUp = true) {
        const cardElem = document.createElement('div');
        
        if (isFaceUp) {
            const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
            cardElem.className = `card ${isRed ? 'red' : 'black'} card-dealing`;
            cardElem.innerHTML = `
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
            cardElem.className = 'card card-back card-dealing';
        }
        
        return cardElem;
    }

    static getSuitSymbol(suit) {
        const symbols = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Clubs': '♣',
            'Spades': '♠'
        };
        return symbols[suit] || suit;
    }
}