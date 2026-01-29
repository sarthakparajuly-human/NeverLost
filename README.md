# NeverLost 🧠

> Memory App that Helps you Remember based on science :D

### Based On
NeverLost is built on :

1. **Leitner System (5-Box Method)**
   - Cards progress through 5 boxes based on recall success
   - Box 1: Daily review
   - Box 2: Every 3 days
   - Box 3: Weekly
   - Box 4: Bi-weekly (14 days)
   - Box 5: Mastered (30 days)
   - Correct answers move cards up; wrong answers reset to Box 1

2. **Ebbinghaus Forgetting Curve**
   - Memory strength decays exponentially over time: `R = e^(-t/S)`
   - `R` = Retrievability (how well you remember)
   - `t` = Time since last review (days)
   - `S` = Stability/Strength of memory

3. **Active Recall**

---

## Project Structure

```
NeverLost/
├── index.html              # Main HTML structure
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
│
├── assets/
│   └── icons/
│       └── sounds/         # Audio assets
│
├── css/
│   ├── main.css            # Core styles
│   ├── animations.css      # CSS animations
│   └── heatmap.css         # Study heatmap styles
│
└── js/
    ├── app.js              # Main application controller
    ├── card.js             # FlashCard class definition
    ├── scheduler.js        # MemoryScheduler (Leitner + Forgetting Curve)
    ├── storage.js          # StorageManager (localStorage handling)
    ├── scratch.js          # ScratchCard interaction
    ├── stats.js            # StatsManager (graphs & visualizations)
    └── heatmap.js          # StudyHeatmap component
```

---

##  Architecture

### Classes

| Class | File | Purpose |
|-------|------|---------|
| `NeverLostApp` | app.js | Main controller, handles UI, navigation, and coordinates all modules |
| `FlashCard` | card.js | Data model for individual flashcards with metadata |
| `MemoryScheduler` | scheduler.js | Implements Leitner system and forgetting curve calculations |
| `StorageManager` | storage.js | Handles localStorage CRUD operations and data persistence |
| `ScratchCard` | scratch.js | Canvas-based scratch-to-reveal interaction + answer comparison |
| `StatsManager` | stats.js | Renders statistics, box visualization, and forgetting curve |
| `StudyHeatmap` | heatmap.js | GitHub-style year heatmap of study activity |

### Data Flow

```
User Action → NeverLostApp → MemoryScheduler (calculates next review)
                          → StorageManager (persists to localStorage)
                          → StatsManager (updates visualizations)
```

## 📚 References

- [Leitner System](https://en.wikipedia.org/wiki/Leitner_system)
- [Forgetting Curve](https://en.wikipedia.org/wiki/Forgetting_curve)
- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)
- [Active Recall](https://en.wikipedia.org/wiki/Active_recall)

Declaration : Ai was used for BugFixes and Logic 
---

## 📄 License

MIT License - Feel free to use, modify, and share!

---
