class FlashCard {
  constructor(concept, trigger, answer, id = null, workspace = 'General') {
    this.id = id || this.generateId();
    this.concept = concept;
    this.trigger = trigger;
    this.answer = answer;
    this.workspace = workspace;
    this.box = 1; 
    this.strength = 1; 
    this.lastReviewed = null;
    this.nextReview = Date.now();
    this.streak = 0; 
    this.totalReviews = 0;
    this.correctReviews = 0;
    this.createdAt = Date.now();
  }

  generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
 
  getAccuracy() {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.correctReviews / this.totalReviews) * 100);
  }

  isMastered() {
    return this.box === 5;
  }

  toJSON() {
    return {
      id: this.id,
      concept: this.concept,
      trigger: this.trigger,
      answer: this.answer,
      workspace: this.workspace,
      box: this.box,
      strength: this.strength,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      streak: this.streak,
      totalReviews: this.totalReviews,
      correctReviews: this.correctReviews,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    const card = new FlashCard(data.concept, data.trigger, data.answer, data.id, data.workspace || 'General');
    card.box = data.box;
    card.strength = data.strength;
    card.lastReviewed = data.lastReviewed;
    card.nextReview = data.nextReview;
    card.streak = data.streak;
    card.totalReviews = data.totalReviews;
    card.correctReviews = data.correctReviews;
    card.createdAt = data.createdAt;
    return card;
  }
}