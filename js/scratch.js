class ScratchCard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.isScratching = false;
    this.revealThreshold = 35;
    this.isRevealed = false;
    this.boundMouseDown = null;
    this.boundMouseUp = null;
    this.boundMouseLeave = null;
    this.boundMouseMove = null;
    this.boundTouchStart = null;
    this.boundTouchEnd = null;
    this.boundTouchMove = null;
  }

  init() {
    if (!this.container) return;

    this.overlay = this.container.querySelector('.scratch-overlay');
    if (!this.overlay) return;

    this.canvas = this.overlay.querySelector('.scratch-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('scratch-canvas');
      this.canvas.id = 'scratch-canvas';
      this.overlay.insertBefore(this.canvas, this.overlay.firstChild);
    }

    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx = this.canvas.getContext('2d');

    this.drawScratchSurface();

    this.overlay.style.display = 'flex';
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';
    this.isRevealed = false;

    this.removeEventListeners();
    this.addEventListeners();
  }

  drawScratchSurface() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 3;

    for (let i = -height; i < width + height; i += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i + height, height);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 4 + 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  addEventListeners() {
    if (!this.canvas) return;

    this.boundMouseDown = (e) => { this.isScratching = true; this.scratch(e); };
    this.boundMouseUp = () => { this.isScratching = false; };
    this.boundMouseLeave = () => { this.isScratching = false; };
    this.boundMouseMove = (e) => { if (this.isScratching) this.scratch(e); };
    
    this.boundTouchStart = (e) => {
      e.preventDefault();
      this.isScratching = true;
      if (e.touches.length > 0) this.scratch(e.touches[0]);
    };
    this.boundTouchEnd = () => { this.isScratching = false; };
    this.boundTouchMove = (e) => {
      e.preventDefault();
      if (this.isScratching && e.touches.length > 0) this.scratch(e.touches[0]);
    };

    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd);
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
  }

  removeEventListeners() {
    if (!this.canvas || !this.boundMouseDown) return;
    
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    this.canvas.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
  }

  scratch(event) {
    if (!this.canvas || !this.ctx || this.isRevealed) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX || event.pageX) - rect.left;
    const y = (event.clientY || event.pageY) - rect.top;

    this.ctx.globalCompositeOperation = 'destination-out';
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2);
    this.ctx.fill();

    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;
      const size = Math.random() * 10 + 5;
      this.ctx.beginPath();
      this.ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.checkRevealPercentage();
  }

  checkRevealPercentage() {
    if (!this.canvas || !this.ctx || this.isRevealed) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    let transparentPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparentPixels++;
    }

    const percentRevealed = (transparentPixels / totalPixels) * 100;

    if (percentRevealed > this.revealThreshold) {
      this.reveal();
    }
  }

  reveal() {
    if (this.isRevealed || !this.overlay) return;
    
    this.isRevealed = true;
    this.overlay.style.transition = 'opacity 0.4s ease-out';
    this.overlay.style.opacity = '0';

    setTimeout(() => {
      if (this.overlay) this.overlay.style.display = 'none';
    }, 400);
  }

  reset() {
    this.isRevealed = false;
    this.isScratching = false;
    
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.style.opacity = '1';
      this.overlay.style.transition = 'none';
    }
    
    if (this.ctx && this.canvas) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.drawScratchSurface();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.isScratching = false;
    this.isRevealed = false;
    
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.style.opacity = '1';
      this.overlay.style.visibility = 'visible';
      this.overlay.style.transition = 'none';
    }
    
    if (this.ctx && this.canvas) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.drawScratchSurface();
    }
    
    this.canvas = null;
    this.ctx = null;
  }
}

class AnswerChecker {
  static calculateSimilarity(userAnswer, correctAnswer) {
    const user = this.normalize(userAnswer);
    const correct = this.normalize(correctAnswer);

    if (!user || !correct) return 0;
    if (user === correct) return 100;

    const levenshteinScore = this.levenshteinSimilarity(user, correct);
    const wordMatchScore = this.wordMatchSimilarity(user, correct);
    const substringScore = this.substringMatchScore(user, correct);

    return Math.round(Math.max(levenshteinScore, wordMatchScore, substringScore));
  }

  static normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  static levenshteinSimilarity(s1, s2) {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 100;
    return (1 - distance / maxLength) * 100;
  }

  static levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[m][n];
  }

  static wordMatchSimilarity(userStr, correctStr) {
    const userWords = new Set(userStr.split(' ').filter(w => w.length > 2));
    const correctWords = new Set(correctStr.split(' ').filter(w => w.length > 2));

    if (correctWords.size === 0) return userWords.size === 0 ? 100 : 0;

    let matches = 0;
    for (const word of userWords) {
      if (correctWords.has(word)) {
        matches++;
      } else {
        for (const correctWord of correctWords) {
          if (this.levenshteinDistance(word, correctWord) <= 2) {
            matches += 0.7;
            break;
          }
        }
      }
    }

    const recall = matches / correctWords.size;
    const precision = userWords.size > 0 ? matches / userWords.size : 0;
    
    if (recall + precision === 0) return 0;
    return ((2 * recall * precision) / (recall + precision)) * 100;
  }

  static substringMatchScore(userStr, correctStr) {
    const correctWords = correctStr.split(' ').filter(w => w.length > 3);
    if (correctWords.length === 0) return 0;

    let foundCount = 0;
    for (const word of correctWords) {
      if (userStr.includes(word)) foundCount++;
    }

    return (foundCount / correctWords.length) * 100;
  }

  static getFeedback(score) {
    if (score >= 90) return { text: 'Excellent', class: 'excellent' };
    if (score >= 70) return { text: 'Good', class: 'good' };
    if (score >= 50) return { text: 'Close', class: 'okay' };
    if (score >= 30) return { text: 'Partial', class: 'partial' };
    return { text: 'Try Again', class: 'needs-work' };
  }
}