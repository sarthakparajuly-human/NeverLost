
class StorageManager {
  constructor() {
    this.CARDS_KEY = 'neverlost_cards';
    this.STATS_KEY = 'neverlost_stats';
    this.HISTORY_KEY = 'neverlost_history';
    this.WORKSPACES_KEY = 'neverlost_workspaces';
  }

  saveCards(cards) {
    const serialized = cards.map(card => card.toJSON());
    localStorage.setItem(this.CARDS_KEY, JSON.stringify(serialized));
  }

  loadCards() {
    const data = localStorage.getItem(this.CARDS_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map(cardData => FlashCard.fromJSON(cardData));
  }

  saveWorkspaces(workspaces) {
    localStorage.setItem(this.WORKSPACES_KEY, JSON.stringify(workspaces));
  }

  loadWorkspaces() {
    const data = localStorage.getItem(this.WORKSPACES_KEY);
    if (!data) return ['General'];
    const workspaces = JSON.parse(data);
    if (!workspaces.includes('General')) {
      workspaces.unshift('General');
    }
    return workspaces;
  }

  addWorkspace(name) {
    const workspaces = this.loadWorkspaces();
    if (!workspaces.includes(name)) {
      workspaces.push(name);
      this.saveWorkspaces(workspaces);
    }
    return workspaces;
  }

  deleteWorkspace(name) {
    if (name === 'General') return this.loadWorkspaces();
    let workspaces = this.loadWorkspaces();
    workspaces = workspaces.filter(w => w !== name);
    this.saveWorkspaces(workspaces);
    return workspaces;
  }

  saveStats(stats) {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  loadStats() {
    const data = localStorage.getItem(this.STATS_KEY);
    if (!data) {
      return {
        bestStreak: 0,
        currentStreak: 0,
        lastStudyDate: null,
        totalStudySessions: 0
      };
    }
    return JSON.parse(data);
  }

  saveHistory(history) {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  loadHistory() {
    const data = localStorage.getItem(this.HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  }

  recordStudy(cardsReviewed) {
    const history = this.loadHistory();
    const today = new Date().toISOString().split('T')[0];
    
    history[today] = (history[today] || 0) + cardsReviewed;
    this.saveHistory(history);
    
    // Update streak
    const stats = this.loadStats();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (stats.lastStudyDate === yesterday || stats.lastStudyDate === today) {
      stats.currentStreak = stats.lastStudyDate === today ? stats.currentStreak : stats.currentStreak + 1;
    } else if (stats.lastStudyDate === null) {
      stats.currentStreak = 1;
    } else {
      stats.currentStreak = 1;
    }
    
    stats.lastStudyDate = today;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    stats.totalStudySessions++;
    
    this.saveStats(stats);
  }

  clearAll() {
    localStorage.removeItem(this.CARDS_KEY);
    localStorage.removeItem(this.STATS_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
  }

  exportData() {
    return {
      cards: this.loadCards().map(c => c.toJSON()),
      stats: this.loadStats(),
      history: this.loadHistory(),
      exportDate: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.cards) {
      const cards = data.cards.map(c => FlashCard.fromJSON(c));
      this.saveCards(cards);
    }
    if (data.stats) this.saveStats(data.stats);
    if (data.history) this.saveHistory(data.history);
  }
}