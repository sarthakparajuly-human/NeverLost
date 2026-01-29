class NeverLostApp {
  constructor() {
    this.storage = new StorageManager();
    this.scheduler = new MemoryScheduler();
    this.cards = this.storage.loadCards();
    this.stats = this.storage.loadStats();
    this.workspaces = this.storage.loadWorkspaces();
    this.currentWorkspace = 'General';
    this.currentCard = null;
    this.studyQueue = [];
    this.scratchCard = null;
    this.heatmap = null;
    this.statsManager = new StatsManager(this.scheduler);
    this.sessionStats = {
      correct: 0,
      total: 0
    };
    
    this.init();
  }

 
  init() {
    this.setupWorkspaces();
    this.setupNavigation();
    this.setupStudyView();
    this.setupCreateView();
    this.setupStatsView();
    this.registerServiceWorker();
    this.showView('study');
  }

  setupWorkspaces() {
    this.renderWorkspaceTabs();
    this.updateWorkspaceDropdown();

    const addBtn = document.getElementById('add-workspace-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.promptNewWorkspace());
    }
  }

  renderWorkspaceTabs() {
    const container = document.getElementById('workspace-tabs');
    if (!container) return;

    let html = '';
    
    this.workspaces.forEach(ws => {
      const isActive = this.currentWorkspace === ws;
      html += `
        <button class="workspace-tab ${isActive ? 'active' : ''}" data-workspace="${ws}">
          ${ws}
          ${ws !== 'General' ? `<span class="workspace-delete" data-workspace="${ws}">x</span>` : ''}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.workspace-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (e.target.classList.contains('workspace-delete')) {
          e.stopPropagation();
          this.deleteWorkspace(e.target.dataset.workspace);
          return;
        }
        this.currentWorkspace = tab.dataset.workspace;
        this.renderWorkspaceTabs();
        this.loadStudyQueue();
        this.loadRecentCards();
      });
    });
  }

  updateWorkspaceDropdown() {
    const dropdown = document.getElementById('input-workspace');
    if (!dropdown) return;

    dropdown.innerHTML = this.workspaces.map(ws => 
      `<option value="${ws}">${ws}</option>`
    ).join('');
  }

  promptNewWorkspace() {
    const name = prompt('Enter workspace name:');
    if (!name || !name.trim()) return;

    const cleanName = name.trim();
    if (this.workspaces.includes(cleanName)) {
      this.showToast('Workspace already exists', 'error');
      return;
    }

    this.workspaces = this.storage.addWorkspace(cleanName);
    this.renderWorkspaceTabs();
    this.updateWorkspaceDropdown();
    this.showToast('Workspace created', 'success');
  }

  deleteWorkspace(name) {
    if (name === 'General') return;
    
    if (!confirm(`Delete "${name}" workspace? Cards will move to General.`)) return;

    this.cards.forEach(card => {
      if (card.workspace === name) {
        card.workspace = 'General';
      }
    });
    this.storage.saveCards(this.cards);

    this.workspaces = this.storage.deleteWorkspace(name);
    
    if (this.currentWorkspace === name) {
      this.currentWorkspace = 'All';
    }

    this.renderWorkspaceTabs();
    this.updateWorkspaceDropdown();
    this.loadStudyQueue();
    this.loadRecentCards();
    this.showToast('Workspace deleted', 'success');
  }

  getFilteredCards() {
    if (this.currentWorkspace === 'All') {
      return this.cards;
    }
    return this.cards.filter(c => c.workspace === this.currentWorkspace);
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.showView(view);
      });
    });
  }


  showView(viewName) {
  
   document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
   
   
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    
 
    if (viewName === 'study') {
      this.loadStudyQueue();
    } else if (viewName === 'create') {
      this.updateWorkspaceDropdown();
      this.loadRecentCards();
    } else if (viewName === 'stats') {
      this.loadStats();
    }
  }

  setupStudyView() {
    const submitBtn = document.getElementById('submit-answer-btn');
    const correctBtn = document.getElementById('correct-btn');
    const wrongBtn = document.getElementById('wrong-btn');
    const userAnswerInput = document.getElementById('user-answer');

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.checkAnswer();
      });
    }

    // Allow Enter key to submit (Shift+Enter for new line)
    if (userAnswerInput) {
      userAnswerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.checkAnswer();
        }
      });
    }
    
    if (correctBtn) {
      correctBtn.addEventListener('click', () => {
        this.handleResponse(true);
      });
    }
    
    if (wrongBtn) {
      wrongBtn.addEventListener('click', () => {
        this.handleResponse(false);
      });
    }
  }


  loadStudyQueue() {
    const filteredCards = this.getFilteredCards();
    this.studyQueue = this.scheduler.getStudyQueue(filteredCards);
    this.updateQueueInfo();
    this.updateSessionStats();
    
    if (this.studyQueue.length > 0) {
      this.showNextCard();
    } else {
      this.showEmptyState();
    }
  }


  showNextCard() {
    if (this.studyQueue.length === 0) {
      this.showEmptyState();
      return;
    }
    
    this.currentCard = this.studyQueue[0];
    
    const cardDisplay = document.getElementById('card-display');
    const emptyState = document.getElementById('empty-state');
    const cardQuestion = document.getElementById('card-question');
    const cardResult = document.getElementById('card-result');
    const userAnswerInput = document.getElementById('user-answer');
    
    // Show card, hide empty state
    if (cardDisplay) cardDisplay.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    
    // Show question phase, hide result phase
    if (cardQuestion) cardQuestion.classList.remove('hidden');
    if (cardResult) cardResult.classList.add('hidden');

    // Populate card content
    const conceptEl = document.getElementById('card-concept');
    const triggerEl = document.getElementById('card-trigger');
    const answerEl = document.getElementById('card-answer');
    
    if (conceptEl) conceptEl.textContent = this.currentCard.concept;
    if (triggerEl) triggerEl.textContent = this.currentCard.trigger;
    if (answerEl) answerEl.textContent = this.currentCard.answer;
    
    // Clear and focus input
    if (userAnswerInput) {
      userAnswerInput.value = '';
      userAnswerInput.focus();
    }
    
    // Clean up scratch card and reset overlay
    if (this.scratchCard) {
      this.scratchCard.destroy();
      this.scratchCard = null;
    }
    
    // Reset scratch overlay visibility for next card
    const scratchOverlay = document.getElementById('scratch-overlay');
    if (scratchOverlay) {
      scratchOverlay.style.display = 'flex';
      scratchOverlay.style.opacity = '1';
      scratchOverlay.style.visibility = 'visible';
    }
    
    this.updateQueueInfo();
  }

  checkAnswer() {
    if (!this.currentCard) return;

    const userAnswerInput = document.getElementById('user-answer');
    const userAnswer = userAnswerInput?.value.trim() || '';

    if (!userAnswer) {
      this.showToast('Please type your answer first', 'error');
      return;
    }

    // Calculate similarity score
    const correctAnswer = this.currentCard.answer;
    const similarity = AnswerChecker.calculateSimilarity(userAnswer, correctAnswer);
    const feedback = AnswerChecker.getFeedback(similarity);

    // Store for later use
    this.lastAnswerScore = similarity;

    // Show result phase
    const cardQuestion = document.getElementById('card-question');
    const cardResult = document.getElementById('card-result');
    
    if (cardQuestion) cardQuestion.classList.add('hidden');
    if (cardResult) cardResult.classList.remove('hidden');

    // Display user's answer
    const userAnswerDisplay = document.getElementById('user-answer-display');
    if (userAnswerDisplay) userAnswerDisplay.textContent = userAnswer;

    // Display accuracy score with animation
    const accuracyScore = document.getElementById('accuracy-score');
    const accuracyLabel = document.getElementById('accuracy-label');
    const accuracyDisplay = document.getElementById('accuracy-display');
    
    if (accuracyScore) {
      // Animate the score counting up
      this.animateScore(accuracyScore, 0, similarity, 500);
    }
    
    if (accuracyLabel) {
      accuracyLabel.textContent = feedback.text;
    }
    
    if (accuracyDisplay) {
      // Remove old classes and add new one
      accuracyDisplay.className = 'accuracy-display ' + feedback.class;
    }

    // Initialize scratch card for correct answer
    this.scratchCard = new ScratchCard('answer-container');
    this.scratchCard.init();
  }

  animateScore(element, start, end, duration) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }

  handleResponse(correct) {
    if (!this.currentCard) return;

    // Update card using scheduler
    this.scheduler.processResponse(this.currentCard, correct);
    
    // Save to storage
    this.storage.saveCards(this.cards);
    
    // Record study session
    this.storage.recordStudy(1);
    this.stats = this.storage.loadStats();
    
    // Update session stats
    this.sessionStats.total++;
    if (correct) this.sessionStats.correct++;
    
    // Show feedback toast
    this.showToast(
      correct ? 'Correct! Moving to next box.' : 'Keep practicing. You will see this again soon.', 
      correct ? 'success' : 'error'
    );
    
    // Remove from queue
    this.studyQueue.shift();
    
    // Update stats display
    this.updateSessionStats();
    
    // Clean up scratch card
    if (this.scratchCard) {
      this.scratchCard.destroy();
      this.scratchCard = null;
    }
    
    // Show next card after delay
    setTimeout(() => {
      this.showNextCard();
    }, 800);
  }

  showEmptyState() {
    const cardDisplay = document.getElementById('card-display');
    const emptyState = document.getElementById('empty-state');
    
    if (cardDisplay) cardDisplay.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
  }

  updateQueueInfo() {
    const queueInfo = document.getElementById('cards-remaining');
    if (queueInfo) {
      queueInfo.textContent = this.studyQueue.length;
    }
  }

  updateSessionStats() {
    const todayCountEl = document.getElementById('today-count');
    const currentStreakEl = document.getElementById('current-streak');
    const accuracyEl = document.getElementById('accuracy');
    
    if (todayCountEl) todayCountEl.textContent = this.sessionStats.total;
    if (currentStreakEl) currentStreakEl.textContent = this.stats.currentStreak;
    
    const accuracy = this.sessionStats.total > 0 
      ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100) 
      : 0;
    
    if (accuracyEl) accuracyEl.textContent = accuracy + '%';
  }

  setupCreateView() {
    const form = document.getElementById('create-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createCard();
      });
    }
  }

  createCard() {
    const conceptInput = document.getElementById('input-concept');
    const triggerInput = document.getElementById('input-trigger');
    const answerInput = document.getElementById('input-answer');
    const workspaceInput = document.getElementById('input-workspace');
    
    const concept = conceptInput?.value.trim() || '';
    const trigger = triggerInput?.value.trim() || '';
    const answer = answerInput?.value.trim() || '';
    const workspace = workspaceInput?.value || 'General';
    
    if (!concept || !trigger || !answer) {
      this.showToast('Please fill in all fields', 'error');
      return;
    }
    
    const card = new FlashCard(concept, trigger, answer, null, workspace);
    this.cards.push(card);
    this.storage.saveCards(this.cards);
    
    
    if (conceptInput) conceptInput.value = '';
    if (triggerInput) triggerInput.value = '';
    if (answerInput) answerInput.value = '';
    
   
    this.showToast('Card created successfully', 'success');
    
    // Refresh
    this.loadRecentCards();
  }

  loadRecentCards() {
    const container = document.getElementById('recent-cards-list');
    if (!container) return;

    const filteredCards = this.getFilteredCards();
    const recent = filteredCards.slice(-5).reverse();
    
    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-text">No cards yet. Create your first one.</p>';
      return;
    }
    
    let html = '<div class="recent-list">';
    recent.forEach(card => {
      html += `
        <div class="recent-card" data-id="${card.id}">
          <div class="recent-card-content">
            <div class="recent-card-concept">${this.escapeHtml(card.concept)}</div>
            <div class="recent-card-meta">${card.workspace} / Box ${card.box} / ${card.getAccuracy()}% accuracy</div>
          </div>
          <div class="recent-card-actions">
            <button class="card-action-btn edit-btn" data-id="${card.id}" title="Edit">Edit</button>
            <button class="card-action-btn delete-btn" data-id="${card.id}" title="Delete">Delete</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    container.innerHTML = html;

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editCard(btn.dataset.id);
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCard(btn.dataset.id);
      });
    });
  }

  editCard(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    const conceptInput = document.getElementById('input-concept');
    const triggerInput = document.getElementById('input-trigger');
    const answerInput = document.getElementById('input-answer');
    const workspaceInput = document.getElementById('input-workspace');

    if (conceptInput) conceptInput.value = card.concept;
    if (triggerInput) triggerInput.value = card.trigger;
    if (answerInput) answerInput.value = card.answer;
    if (workspaceInput) workspaceInput.value = card.workspace;

    this.deleteCard(cardId, true);
    
    if (conceptInput) conceptInput.focus();
    this.showToast('Edit the card and save', 'info');
  }

  deleteCard(cardId, silent = false) {
    const index = this.cards.findIndex(c => c.id === cardId);
    if (index === -1) return;

    this.cards.splice(index, 1);
    this.storage.saveCards(this.cards);
    
    if (!silent) {
      this.showToast('Card deleted', 'success');
    }
    
    this.loadRecentCards();
  }


  setupStatsView() {
    this.heatmap = new StudyHeatmap('heatmap-container', this.storage);
  }

  loadStats() {
    this.statsManager.updateOverview(this.cards, this.stats);
    this.statsManager.renderBoxes(this.cards);
    this.statsManager.drawForgettingCurve(5);
    
    if (this.heatmap) {
      this.heatmap.update();
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new NeverLostApp();
});