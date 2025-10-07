// player.js
export class Player {
    constructor(name, isHuman = true) {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.isHuman = isHuman;
        this.isStanding = false;
    }
    
    addCard(card) {
        this.hand.push(card);
        this.calculateScore();
    }
    
    calculateScore() {
        let score = 0;
        let aces = 0;
        
        for (let card of this.hand) {
            score += card.value;
            if (card.rank === 'Ace') aces++;
        }
        
        // Handle aces (11 or 1)
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        this.score = score;
        return score;
    }
    
    clearHand() {
        this.hand = [];
        this.score = 0;
        this.isStanding = false;
    }
    
    stand() {
        this.isStanding = true;
    }
}