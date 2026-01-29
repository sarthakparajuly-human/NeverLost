class MemoryScheduler {
  constructor() {
    this.boxIntervals = {
      1: 1,
      2: 3,
      3: 7,
      4: 14,
      5: 30
    };
  }

  calculateRetrievability(card) {
    if (!card.lastReviewed) return 0;
    
    const t = (Date.now() - card.lastReviewed) / (1000 * 60 * 60 * 24); // Convert to days
    const S = card.strength;
    const R = Math.exp(-t / S);
    
    return Math.min(Math.max(R, 0), 1); // Clamp between 0 and 1
  }
   isDue(card) {
    return Date.now() >= card.nextReview;
  }

  processResponse(card, correct) {
    card.totalReviews++;
    
    if (correct) {
      card.correctReviews++;
      card.streak++;
      
      // Increase memory strength (gets stronger each time)
      card.strength = card.strength * 1.3;
      
      // Move to next box (max: box 5)
      card.box = Math.min(card.box + 1, 5);
    } else {
      card.streak = 0;
      
      // Decrease memory strength
      card.strength = Math.max(card.strength * 0.5, 1);
      
      // Move back to box 1
      card.box = 1;
    }
    
    // Update review timestamps
    card.lastReviewed = Date.now();
    card.nextReview = this.calculateNextReview(card);
    
    return card;
  }

  calculateNextReview(card) {
    const intervalDays = this.boxIntervals[card.box];
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
    return Date.now() + intervalMs;
  }

  getStudyQueue(allCards) {
    const dueCards = allCards.filter(card => this.isDue(card));
    
    // Sort by retrievability (lowest first = most forgotten)
    return dueCards.sort((a, b) => {
      const retrievabilityA = this.calculateRetrievability(a);
      const retrievabilityB = this.calculateRetrievability(b);
      return retrievabilityA - retrievabilityB;
    });
  }

   getBoxStats(allCards) {
    const stats = {
      1: { count: 0, label: 'Daily' },
      2: { count: 0, label: 'Every 3 days' },
      3: { count: 0, label: 'Weekly' },
      4: { count: 0, label: 'Bi-weekly' },
      5: { count: 0, label: 'Mastered' }
    };
    
    allCards.forEach(card => {
      stats[card.box].count++;
    });
    
    return stats;
  }

  generateForgettingCurveData(strength, days = 30) {
    const data = [];
    for (let t = 0; t <= days; t++) {
      const R = Math.exp(-t / strength);
      data.push({ day: t, retrievability: R });
    }
    return data;
  }
}
