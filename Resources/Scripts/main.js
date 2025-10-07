document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const arena = document.querySelector('.arena');
    const playerFighter = document.querySelector('.fighter.player');
    const enemyFighter = document.querySelector('.fighter.enemy');
    const playerHealth = document.querySelector('.player .health-fill');
    const enemyHealth = document.querySelector('.enemy .health-fill');
    const fightMessage = document.querySelector('.fight-message');
    const roundIndicator = document.querySelector('.round-indicator');
    
    // Buttons
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Stats
    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const roundElement = document.getElementById('round');
    
    // Tournament bracket
    const bracketElement = document.getElementById('bracket');
    
    // Game state
    let gameState = {
        isRunning: false,
        currentRound: 1,
        playerHealth: 100,
        enemyHealth: 100,
        wins: 0,
        losses: 0,
        matches: [],
        currentMatch: 0,
        fighters: [
            { name: "Player", health: 100, wins: 0, losses: 0 },
            { name: "Blue Fighter", health: 100, wins: 0, losses: 0 },
            { name: "Red Warrior", health: 100, wins: 0, losses: 0 },
            { name: "Green Champion", health: 100, wins: 0, losses: 0 }
        ]
    };
    
    // Initialize the tournament bracket
    function initializeBracket() {
        bracketElement.innerHTML = '';
        gameState.matches = [];
        
        // Create round-robin matches (each fighter fights every other fighter)
        for (let i = 0; i < gameState.fighters.length; i++) {
            for (let j = i + 1; j < gameState.fighters.length; j++) {
                gameState.matches.push({
                    fighter1: gameState.fighters[i].name,
                    fighter2: gameState.fighters[j].name,
                    score1: 0,
                    score2: 0,
                    winner: null
                });
            }
        }
        
        // Display matches in the bracket
        gameState.matches.forEach((match, index) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match';
            matchElement.innerHTML = `
                <div class="match-number">${index + 1}</div>
                <div class="match-fighters">${match.fighter1} vs ${match.fighter2}</div>
                <div class="match-score">${match.score1}-${match.score2}</div>
            `;
            bracketElement.appendChild(matchElement);
        });
    }
    
    // Start the tournament
    startBtn.addEventListener('click', function() {
        if (!gameState.isRunning) {
            gameState.isRunning = true;
            startBtn.disabled = true;
            nextBtn.disabled = false;
            gameState.currentMatch = 0;
            playNextMatch();
        }
    });
    
    // Move to the next fight
    nextBtn.addEventListener('click', function() {
        if (gameState.isRunning) {
            playNextMatch();
        }
    });
    
    // Reset the game
    resetBtn.addEventListener('click', function() {
        gameState.isRunning = false;
        gameState.currentRound = 1;
        gameState.playerHealth = 100;
        gameState.enemyHealth = 100;
        gameState.wins = 0;
        gameState.losses = 0;
        gameState.currentMatch = 0;
        
        playerHealth.style.width = '100%';
        enemyHealth.style.width = '100%';
        
        startBtn.disabled = false;
        nextBtn.disabled = true;
        
        updateStats();
        initializeBracket();
        
        // Reset fighter positions
        playerFighter.style.left = '20%';
        enemyFighter.style.left = 'calc(80% - 60px)';
        
        // Reset round indicator
        roundIndicator.textContent = `Round ${gameState.currentRound}`;
    });
    
    // Play the next match in the tournament
    function playNextMatch() {
        if (gameState.currentMatch >= gameState.matches.length) {
            // Tournament is over
            gameState.isRunning = false;
            nextBtn.disabled = true;
            fightMessage.textContent = "TOURNAMENT OVER!";
            fightMessage.classList.add('show');
            setTimeout(() => {
                fightMessage.classList.remove('show');
            }, 3000);
            return;
        }
        
        const match = gameState.matches[gameState.currentMatch];
        const fighter1 = gameState.fighters.find(f => f.name === match.fighter1);
        const fighter2 = gameState.fighters.find(f => f.name === match.fighter2);
        
        // Update fighter names in the arena
        document.querySelector('.player .fighter-name').textContent = fighter1.name;
        document.querySelector('.enemy .fighter-name').textContent = fighter2.name;
        
        // Update round indicator
        roundIndicator.textContent = `Match ${gameState.currentMatch + 1}`;
        
        // Reset health for the new match
        gameState.playerHealth = 100;
        gameState.enemyHealth = 100;
        playerHealth.style.width = '100%';
        enemyHealth.style.width = '100%';
        
        // Show fight message
        fightMessage.textContent = "FIGHT!";
        fightMessage.classList.add('show');
        
        // Start the fight simulation after a delay
        setTimeout(() => {
            fightMessage.classList.remove('show');
            simulateFight(fighter1, fighter2, match);
        }, 1500);
    }
    
    // Simulate a fight between two fighters
    function simulateFight(fighter1, fighter2, match) {
        let fightInterval = setInterval(() => {
            // Randomly determine who attacks
            const attacker = Math.random() > 0.5 ? fighter1 : fighter2;
            const defender = attacker === fighter1 ? fighter2 : fighter1;
            
            // Calculate damage (between 5 and 15)
            const damage = Math.floor(Math.random() * 11) + 5;
            
            // Apply damage
            if (defender === fighter1) {
                gameState.playerHealth = Math.max(0, gameState.playerHealth - damage);
                playerHealth.style.width = `${gameState.playerHealth}%`;
                
                // Visual feedback for hit
                playerFighter.style.transform = 'translateX(-5px)';
                setTimeout(() => {
                    playerFighter.style.transform = 'translateX(0)';
                }, 100);
            } else {
                gameState.enemyHealth = Math.max(0, gameState.enemyHealth - damage);
                enemyHealth.style.width = `${gameState.enemyHealth}%`;
                
                // Visual feedback for hit
                enemyFighter.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    enemyFighter.style.transform = 'translateX(0)';
                }, 100);
            }
            
            // Move fighters based on health difference
            const healthDiff = gameState.playerHealth - gameState.enemyHealth;
            const playerPos = 20 + (healthDiff * 0.1);
            const enemyPos = 80 - (healthDiff * 0.1);
            
            playerFighter.style.left = `${Math.max(5, Math.min(40, playerPos))}%`;
            enemyFighter.style.left = `calc(${Math.max(40, Math.min(75, enemyPos))}% - 60px)`;
            
            // Check if fight is over
            if (gameState.playerHealth <= 0 || gameState.enemyHealth <= 0) {
                clearInterval(fightInterval);
                
                // Determine winner
                let winner;
                if (gameState.playerHealth <= 0 && gameState.enemyHealth <= 0) {
                    winner = Math.random() > 0.5 ? fighter1 : fighter2;
                } else if (gameState.playerHealth <= 0) {
                    winner = fighter2;
                } else {
                    winner = fighter1;
                }
                
                // Update match results
                if (winner === fighter1) {
                    match.score1 = 1;
                    fighter1.wins++;
                    fighter2.losses++;
                } else {
                    match.score2 = 1;
                    fighter2.wins++;
                    fighter1.losses++;
                }
                match.winner = winner.name;
                
                // Update bracket display
                const matchElement = bracketElement.children[gameState.currentMatch];
                matchElement.classList.add('winner');
                matchElement.querySelector('.match-score').textContent = `${match.score1}-${match.score2}`;
                
                // Update stats if player was involved
                if (fighter1.name === "Player" || fighter2.name === "Player") {
                    if (winner.name === "Player") {
                        gameState.wins++;
                    } else {
                        gameState.losses++;
                    }
                    updateStats();
                }
                
                // Move to next match after a delay
                setTimeout(() => {
                    gameState.currentMatch++;
                    if (gameState.currentMatch < gameState.matches.length) {
                        playNextMatch();
                    } else {
                        gameState.isRunning = false;
                        nextBtn.disabled = true;
                        fightMessage.textContent = "TOURNAMENT OVER!";
                        fightMessage.classList.add('show');
                        setTimeout(() => {
                            fightMessage.classList.remove('show');
                        }, 3000);
                    }
                }, 2000);
            }
        }, 300);
    }
    
    // Update statistics display
    function updateStats() {
        winsElement.textContent = gameState.wins;
        lossesElement.textContent = gameState.losses;
        roundElement.textContent = gameState.currentRound;
    }
    
    // Initialize the game
    initializeBracket();
    updateStats();
});