class StudyHeatmap {
  constructor(containerId, storage) {
    this.container = document.getElementById(containerId);
    this.storage = storage;
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  update() {
    if (!this.container) return;
    
    const history = this.storage.loadHistory();
    this.render(history);
  }

  render(history) {
    const today = new Date();
    
    // Calculate max value for scaling
    const values = Object.values(history);
    const maxValue = Math.max(...values, 1);

    let html = '<div class="heatmap-wrapper">';
    
    // Month labels - positioned above the weeks
    html += '<div class="heatmap-months">';
    for (let i = 0; i < 12; i++) {
      const monthIndex = (today.getMonth() - 11 + i + 12) % 12;
      html += `<span class="month-label">${this.months[monthIndex]}</span>`;
    }
    html += '</div>';

    // Heatmap grid - 7 rows (Sun-Sat) x 53 weeks
    html += '<div class="heatmap-grid">';
    
    // Start from 52 weeks ago, aligned to Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364 - startDate.getDay());
    
    // Generate cells week by week (column by column)
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (week * 7) + day);
        
        // Don't show future dates
        if (cellDate > today) {
          html += `<div class="heatmap-cell level-0" style="opacity: 0.3;"></div>`;
          continue;
        }
        
        const dateStr = cellDate.toISOString().split('T')[0];
        const count = history[dateStr] || 0;
        const level = this.getLevel(count, maxValue);
        const monthName = cellDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
        
        html += `<div class="heatmap-cell level-${level}" 
                      data-date="${dateStr}" 
                      data-count="${count}"
                      title="${monthName}: ${count} cards"></div>`;
      }
    }
    
    html += '</div>';

    // Legend
    html += `
      <div class="heatmap-legend">
        <span>Less</span>
        <div class="legend-cell level-0"></div>
        <div class="legend-cell level-1"></div>
        <div class="legend-cell level-2"></div>
        <div class="legend-cell level-3"></div>
        <div class="legend-cell level-4"></div>
        <span>More</span>
      </div>
    `;

    html += '</div>';
    
    this.container.innerHTML = html;
  }

  getLevel(count, maxValue) {
    if (count === 0) return 0;
    
    const ratio = count / maxValue;
    
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  getDateCount(dateStr) {
    const history = this.storage.loadHistory();
    return history[dateStr] || 0;
  }

  getRecentTotal(days = 7) {
    const history = this.storage.loadHistory();
    let total = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      total += history[dateStr] || 0;
    }
    
    return total;
  }

  calculateStreak() {
    const history = this.storage.loadHistory();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (history[dateStr] && history[dateStr] > 0) {
        streak++;
      } else if (i > 0) {
        // Allow today to not be studied yet
        break;
      }
    }
    
    return streak;
  }
}
