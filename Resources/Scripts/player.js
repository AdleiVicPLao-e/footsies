// player.js
export class Player {
    constructor(name, isHuman = true, cardDesign = 'player') {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.isHuman = isHuman;
        this.isStanding = false;
        this.cardDesign = cardDesign;
    }
    
    addCard(card) {
        this.hand.push(card);
        this.calculateScore();
    }
    
    calculateScore() {
        let score = 0;
        let aces = 0;
        
        // First pass: calculate base score and count aces
        for (let card of this.hand) {
            score += card.value;
            if (card.rank === 'Ace') aces++;
        }
        
        // Second pass: adjust for aces if needed
        while (score > 21 && aces > 0) {
            score -= 10; // Convert Ace from 11 to 1
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
    
    // Helper method to check if bust
    isBust() {
        return this.score > 21;
    }
    
    // Helper method to check if has blackjack
    hasBlackjack() {
        return this.hand.length === 2 && this.score === 21;
    }
}