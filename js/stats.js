class StatsManager {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }

  updateOverview(cards, stats) {
    const totalCards = document.getElementById('total-cards');
    const masteredCards = document.getElementById('mastered-cards');
    const learningCards = document.getElementById('learning-cards');
    const bestStreak = document.getElementById('best-streak');

    if (totalCards) totalCards.textContent = cards.length;
    
    const mastered = cards.filter(card => card.box === 5).length;
    if (masteredCards) masteredCards.textContent = mastered;
    
    const learning = cards.filter(card => card.box < 5).length;
    if (learningCards) learningCards.textContent = learning;
    
    if (bestStreak) bestStreak.textContent = stats.bestStreak || 0;
  }

  renderBoxes(cards) {
    const container = document.getElementById('boxes-visulization');
    if (!container) return;

    const boxStats = this.scheduler.getBoxStats(cards);
    const totalCards = cards.length || 1;

    let html = '<div class="boxes-grid">';
    
    for (let box = 1; box <= 5; box++) {
      const stat = boxStats[box];
      const percentage = Math.round((stat.count / totalCards) * 100);
      const boxColors = {
        1: '#ff6b6b',
        2: '#ffa94d', 
        3: '#ffd93d',
        4: '#69db7c',
        5: '#51cf66'
      };
      
      html += `
        <div class="box-card">
          <div class="box-number">Box ${box}</div>
          <div class="box-label">${stat.label}</div>
          <div class="box-count" style="color: ${boxColors[box]}">${stat.count}</div>
          <div class="box-bar">
            <div class="box-bar-fill" style="width: ${percentage}%; background: ${boxColors[box]}"></div>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    container.innerHTML = html;
  }

  drawForgettingCurve(strength = 5) {
    const canvas = document.getElementById('forgetting-curve');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    // Clear canvas
    ctx.fillStyle = '#fffef9';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (width - 2 * padding) * (i / 6);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw forgetting curves for different strengths
    const strengths = [1, 3, 5, 10];
    const colors = ['#ff6b6b', '#ffa94d', '#667eea', '#51cf66'];
    const labels = ['Weak (S=1)', 'Medium (S=3)', 'Strong (S=5)', 'Mastered (S=10)'];

    strengths.forEach((s, index) => {
      ctx.strokeStyle = colors[index];
      ctx.lineWidth = 3;
      ctx.beginPath();

      for (let day = 0; day <= 30; day++) {
        const R = Math.exp(-day / s);
        const x = padding + (day / 30) * (width - 2 * padding);
        const y = height - padding - R * (height - 2 * padding);

        if (day === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = '#2d3748';
    ctx.font = '14px "Indie Flower", cursive';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i <= 6; i++) {
      const day = i * 5;
      const x = padding + (day / 30) * (width - 2 * padding);
      ctx.fillText(`${day}d`, x, height - padding + 25);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const percent = 100 - i * 25;
      const y = padding + (height - 2 * padding) * (i / 4);
      ctx.fillText(`${percent}%`, padding - 10, y + 5);
    }

    // Axis titles
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Indie Flower", cursive';
    ctx.fillText('Days Since Review', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Memory Retention', 0, 0);
    ctx.restore();

    // Draw legend
    ctx.font = '12px "Indie Flower", cursive';
    ctx.textAlign = 'left';
    const legendX = width - padding - 100;
    const legendY = padding + 20;

    labels.forEach((label, index) => {
      const y = legendY + index * 25;
      ctx.fillStyle = colors[index];
      ctx.fillRect(legendX, y - 8, 15, 15);
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, y - 8, 15, 15);
      ctx.fillStyle = '#2d3748';
      ctx.fillText(label, legendX + 22, y + 4);
    });
  }
}
