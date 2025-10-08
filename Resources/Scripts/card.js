// card.js
export class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
        this.imagePath = this.getImagePath();
    }

    toString() {
        return `${this.rank} of ${this.suit}`;
    }

    getImagePath() {
        // Convert suit to filename format (lowercase)
        const suitName = this.suit.toLowerCase();
        
        // Convert rank to filename format
        let rankName;
        switch(this.rank) {
            case 'A': rankName = 'ace'; break;
            case 'K': rankName = 'king'; break;
            case 'Q': rankName = 'queen'; break;
            case 'J': rankName = 'jack'; break;
            case '10': rankName = '10'; break;
            default: 
                // Only add leading zero for numeric cards 2-9
                if (['2','3','4','5','6','7','8','9'].includes(this.rank)) {
                    rankName = `0${this.rank}`;
                } else {
                    rankName = this.rank; // Fallback
                }
                break;
        }

        return `./Resources/Assets/Images/Cards/${suitName}_${rankName}.png`;
    }

    getBackImagePath(backDesign = 'player') {
        return `./Resources/Assets/Images/Cards/back_${backDesign}.png`;
    }
}