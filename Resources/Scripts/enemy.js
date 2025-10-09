// src/enemy.js
import { Player } from "./player.js";

// Base Enemy class that all specific enemies extend
export class Enemy extends Player {
  constructor(name, difficulty, cardDesign = "intermediate") {
    super(name, false);
    this.difficulty = difficulty;
    this.cardDesign = cardDesign;
  }

  // Default implementations that can be overridden
  shouldHit() {
    return this.score <= 16; // Default behavior
  }

  shouldDoubleDown() {
    return false; // Default: no double down
  }

  shouldSplit() {
    return false; // Default: no splitting
  }

  hasSoftHand() {
    return this.hand.some((card) => card.rank === "Ace") && this.score <= 11;
  }
}

export class BeginnerEnemy extends Enemy {
  constructor(name, cardDesign = "easy") {
    super(name, "easy", cardDesign);
  }

  shouldHit() {
    // Simple: hit on 15 or less, stand on 16 or higher
    return this.score <= 15;
  }
}

export class IntermediateEnemy extends Enemy {
  constructor(name, cardDesign = "intermediate") {
    super(name, "medium", cardDesign);
  }

  shouldHit() {
    if (this.hasSoftHand()) {
      return this.score <= 17;
    }
    return this.score <= 16;
  }

  shouldDoubleDown() {
    return this.score === 10 || this.score === 11;
  }

  shouldSplit() {
    if (this.hand.length === 2 && this.hand[0].rank === this.hand[1].rank) {
      return this.hand[0].rank === "Ace" || this.hand[0].rank === "8";
    }
    return false;
  }
}

export class ExpertEnemy extends Enemy {
  constructor(name, cardDesign = "expert") {
    super(name, "hard", cardDesign);
    this.strategyTable = this.initializeStrategyTable();
  }

  initializeStrategyTable() {
    return {
      hard: {
        8: [17, [], []],
        9: [17, [3, 4, 5, 6], []],
        10: [17, [2, 3, 4, 5, 6, 7, 8, 9], []],
        11: [17, [2, 3, 4, 5, 6, 7, 8, 9, 10], []],
        12: [16, [], []],
        13: [16, [], []],
        14: [16, [], []],
        15: [16, [], []],
        16: [16, [], []],
        17: [17, [], []],
      },
      soft: {
        13: [18, [5, 6], []],
        14: [18, [5, 6], []],
        15: [18, [4, 5, 6], []],
        16: [18, [4, 5, 6], []],
        17: [18, [3, 4, 5, 6], []],
        18: [18, [], []],
      },
    };
  }

  shouldHit() {
    const handType = this.hasSoftHand() ? "soft" : "hard";
    const strategy = this.strategyTable[handType][this.score];
    return strategy ? this.score < strategy[0] : this.score <= 16;
  }

  shouldDoubleDown() {
    const handType = this.hasSoftHand() ? "soft" : "hard";
    const strategy = this.strategyTable[handType][this.score];
    return strategy && strategy[1].length > 0;
  }

  shouldSplit() {
    if (this.hand.length === 2 && this.hand[0].rank === this.hand[1].rank) {
      const pairs = ["Ace", "8", "9", "10"];
      return pairs.includes(this.hand[0].rank);
    }
    return false;
  }
}

export class RandomEnemy extends Enemy {
  constructor(name, cardDesign = "random") {
    super(name, "random", cardDesign);
  }

  shouldHit() {
    if (this.score <= 12) return Math.random() < 0.8;
    if (this.score <= 16) return Math.random() < 0.5;
    if (this.score <= 18) return Math.random() < 0.2;
    return false;
  }

  shouldDoubleDown() {
    return Math.random() < 0.3;
  }

  shouldSplit() {
    if (this.hand.length === 2 && this.hand[0].rank === this.hand[1].rank) {
      return Math.random() < 0.5;
    }
    return false;
  }
}

export class AdaptiveEnemy extends Enemy {
  constructor(name, cardDesign = "adaptive") {
    super(name, "adaptive", cardDesign);
    this.aggressionLevel = 0.5;
    this.previousResults = [];
  }

  shouldHit() {
    this.updateAggression();

    let hitThreshold;
    if (this.aggressionLevel > 0.7) {
      hitThreshold = 18;
    } else if (this.aggressionLevel > 0.3) {
      hitThreshold = 17;
    } else {
      hitThreshold = 16;
    }

    return this.score < hitThreshold;
  }

  shouldDoubleDown() {
    this.updateAggression();
    const baseChance = this.score >= 10 && this.score <= 11 ? 0.7 : 0.3;
    return Math.random() < baseChance * this.aggressionLevel;
  }

  shouldSplit() {
    if (this.hand.length === 2 && this.hand[0].rank === this.hand[1].rank) {
      this.updateAggression();
      const chance = ["Ace", "8"].includes(this.hand[0].rank) ? 0.8 : 0.4;
      return Math.random() < chance * this.aggressionLevel;
    }
    return false;
  }

  updateAggression() {
    const recentLosses = this.previousResults.filter(
      (result) => result === "loss"
    ).length;
    const recentWins = this.previousResults.filter(
      (result) => result === "win"
    ).length;

    if (recentLosses > recentWins) {
      this.aggressionLevel = Math.min(1, this.aggressionLevel + 0.1);
    } else if (recentWins > recentLosses) {
      this.aggressionLevel = Math.max(0, this.aggressionLevel - 0.1);
    }
  }

  recordResult(result) {
    this.previousResults.push(result);
    if (this.previousResults.length > 5) {
      this.previousResults.shift();
    }
  }
}

// Factory function to create enemies by type
export function createEnemy(type, name, cardDesign = null) {
  const enemyClasses = {
    BeginnerEnemy: BeginnerEnemy,
    IntermediateEnemy: IntermediateEnemy,
    ExpertEnemy: ExpertEnemy,
    RandomEnemy: RandomEnemy,
    AdaptiveEnemy: AdaptiveEnemy,
  };

  const EnemyClass = enemyClasses[type] || Enemy;

  // If no specific design provided, use the default for that enemy type
  if (!cardDesign) {
    const defaultDesigns = {
      BeginnerEnemy: "easy",
      IntermediateEnemy: "intermediate",
      ExpertEnemy: "expert",
      RandomEnemy: "random",
      AdaptiveEnemy: "adaptive",
    };
    cardDesign = defaultDesigns[type] || "intermediate";
  }

  return new EnemyClass(name, cardDesign);
}
