// deck.js
import { Card } from "./card.js";

export class Deck {
  constructor() {
    this.cards = [];
    this.initializeDeck();
  }

  initializeDeck() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
      {
        rank: "2",
        value: 2,
      },
      {
        rank: "3",
        value: 3,
      },
      {
        rank: "4",
        value: 4,
      },
      {
        rank: "5",
        value: 5,
      },
      {
        rank: "6",
        value: 6,
      },
      {
        rank: "7",
        value: 7,
      },
      {
        rank: "8",
        value: 8,
      },
      {
        rank: "9",
        value: 9,
      },
      {
        rank: "10",
        value: 10,
      },
      {
        rank: "J",
        value: 10,
      },
      {
        rank: "Q",
        value: 10,
      },
      {
        rank: "K",
        value: 10,
      },
      {
        rank: "A",
        value: 11,
      },
    ];

    for (let suit of suits) {
      for (let rankObj of ranks) {
        this.cards.push(new Card(suit, rankObj.rank, rankObj.value));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard() {
    return this.cards.pop();
  }
}
