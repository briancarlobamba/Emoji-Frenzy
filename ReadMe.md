# ⚡ Emoji Frenzy

Welcome to **Emoji Frenzy**, a vibrant neon-lit, arcade-style browser game where you tap your way to glory! Built with vanilla JavaScript, HTML5, and CSS3, this game features a retro-futuristic aesthetic with classic whack-a-mole gameplay, enhanced with modern UI flair and exciting mechanics.

![Emoji Frenzy Banner](https://placeholder-image.com/emoji-frenzy-banner.png)

## 🎮 Gameplay

**Objective:**  
Tap the glowing creatures that emerge from neon portals to earn points within a 30-second time limit. Build combos for bonus multipliers and special effects, but watch out for bombs - they'll cost you points and reset your combo streak!

### 🕹️ How to Play

- **Standard Creatures (👾 👽 🤖 💀 🛸 🔮)**: +1 point each
- **Bonus Creatures (⚡)**: +5 points each
- **Special Rare Creatures (🌟)**: +10 points + 3 seconds bonus time
- **Bomb Creatures (💣)**: -3 points and resets combo
- **Combo System**: 
  - Build consecutive hits without missing
  - Every 5 hits: Activates slow-motion mode
  - Higher combos increase score multipliers:
    - 5+ hits: 2x multiplier
    - 10+ hits: 3x multiplier
    - 15+ hits: 4x multiplier

### 💥 Features

- **Neon Cyberpunk Visuals**: Immersive Tron-style UI with pulsing effects
- **Dynamic Difficulty**: Game speed increases as your score rises
- **Combo Multiplier System**: Chain hits together for higher scores
- **Special Effects**: Slow-motion mode, screen flashes, and portal animations
- **Sound Effects & Music**: Full audio experience with mute option
- **Mobile Responsive**: Play on any device, from desktop to mobile
- **High Score Tracker**: Saved locally to challenge yourself

## 🎯 Difficulty Levels

- **Easy**: Slower creature appearance, longer visibility time, fewer bombs
- **Medium**: Balanced difficulty with moderate speed and bomb frequency
- **Hard**: Fast-paced gameplay with quick creature appearances and more bombs

## 🛠️ Technical Details

### Tech Stack
- **HTML5**: Semantic structure and audio elements
- **CSS3**: Advanced animations, transitions, and custom properties
- **JavaScript**: Vanilla JS for game logic and interactivity

### Code Structure
- **Event-Driven Architecture**: Clean separation of game mechanics
- **Responsive Design**: Adapts to all screen sizes
- **LocalStorage Integration**: For persisting high scores
- **Performance Optimized**: Smooth animations even on mobile devices

### Browser Compatibility
Tested and working on recent versions of Chrome, Firefox, Safari, and Edge.

## 🚀 Future Enhancements

- Additional creature types with unique effects
- Power-ups that appear during gameplay
- Online high score leaderboard
- Multiple game modes (survival, timed challenges)
- Theme selector with different visual styles

## 🎨 Credits

- All game design & code: [Your Name]
- Sound effects: [Source]
- Background music: [Artist/Source]

---

## 🔧 Development

### Installation
1. Clone this repository
2. Open index.html in your browser
3. No build tools or dependencies required!

### Customization
Want to modify the game? Here are some quick tips:
- Adjust difficulty in script.js (look for `getDifficultyFactor()`)
- Add new creature types in the creature arrays
- Customize visual effects in style.css

---

Enjoy the game and share your high scores! 💫