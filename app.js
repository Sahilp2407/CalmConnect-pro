// CalmConnect App JavaScript - Fixed Version
// Main application class for CalmConnect
class CalmConnectApp {
    constructor() {
        // Current mood selection
        this.currentMood = null;
        // Mood history from localStorage
        this.moodHistory = this.loadMoodHistory();
        // Chat history from localStorage
        this.chatHistory = this.loadChatHistory();
        // Current self-care tool
        this.currentTool = null;
        // Chart.js instance
        this.moodChart = null;
        // Institutional mode flag
        this.institutionalMode = this.checkInstitutionalMode();
        // Institution name
        this.institutionName = this.getInstitutionName();
        this.init();
    }

    init() {
        // Setup navigation and branding
        this.setupNavigation();
        this.setupInstitutionalMode();
    }

    setupNavigation() {
        // Highlight current page in navbar
        const currentPage = window.location.pathname.split("/").pop().replace(".html", "") || "index";
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    checkInstitutionalMode() {
        // Check for institutional mode
        const urlParams = new URLSearchParams(window.location.search);
        const institution = urlParams.get('institution');
        if (institution) {
            localStorage.setItem('institutionalMode', 'true');
            localStorage.setItem('institutionName', institution);
            return true;
        }
        return localStorage.getItem('institutionalMode') === 'true';
    }

    getInstitutionName() {
        // Get institution name
        return localStorage.getItem('institutionName') || 'Demo Institution';
    }

    setupInstitutionalMode() {
        // Update branding for institutional mode
        if (this.institutionalMode) {
            document.body.classList.add('institutional-mode');
            const logos = document.querySelectorAll('.logo, .brand-logo');
            logos.forEach(logo => {
                if (logo.textContent) {
                    logo.textContent = `${this.institutionName} - CalmConnect`;
                }
            });
        }
    }

    // Self-Care functionality
    initSelfCare() {
        // Setup self-care tool listeners and modal
        this.setupSelfCareTools();
        this.createModal();
    }

    setupSelfCareTools() {
        // Listen for self-care tool card clicks
        const selfCareGrid = document.querySelector(".self-care-grid");
        if (selfCareGrid) {
            selfCareGrid.addEventListener("click", (e) => {
                const button = e.target.closest(".tool-card button");
                if (button) {
                    e.preventDefault();
                    const card = button.closest(".tool-card");
                    const toolType = card.dataset.tool;
                    this.openSelfCareTool(toolType);
                }
            });
        }
    }

    getToolType(card) {
        // Get tool type from card
        return card.dataset.tool;
    }

    createModal() {
        // Create or replace self-care modal
        const existingModal = document.getElementById('tool-modal');
        if (existingModal) {
            existingModal.remove();
        }
        const modal = document.createElement('div');
        modal.id = 'tool-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="tool-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openSelfCareTool(toolType) {
        // Open modal and load tool content
        const modal = document.getElementById('tool-modal');
        const content = document.getElementById('tool-content');
        if (!modal || !content) {
            this.createModal();
            return this.openSelfCareTool(toolType);
        }
        this.currentTool = toolType;
        content.innerHTML = this.getToolContent(toolType);
        modal.style.display = 'block';
        this.initializeToolFunctionality(toolType);
    }

    getToolContent(toolType) {
        // Return HTML for selected tool
        switch (toolType) {
            case 'breathing':
                return this.getBreathingContent();
            case 'meditation':
                return this.getMeditationContent();
            case 'gratitude':
                return this.getGratitudeContent();
            case 'affirmations':
                return this.getAffirmationsContent();
            case 'music':
                return this.getMusicContent();
            case 'exercises':
                return this.getExercisesContent();
            case 'visualization':
                return this.getVisualizationContent();
            case 'psychology':
                return this.getPsychologyContent();
            default:
                return '<h3>Tool not found</h3>';
        }
    }

    getBreathingContent() {
        return `
            <h3>🌬️ Breathing Exercises</h3>
            <div class="breathing-exercise">
                <div class="breathing-circle" id="breathing-circle">
                    <div class="breathing-text" id="breathing-text">Ready</div>
                </div>
                <div class="breathing-controls">
                    <button id="start-breathing" class="btn btn-primary">Start Exercise</button>
                    <button id="stop-breathing" class="btn btn-secondary" style="display: none;">Stop</button>
                </div>
                <div class="breathing-instructions">
                    <p>Follow the circle's movement:</p>
                    <ul>
                        <li>Breathe in as the circle expands</li>
                        <li>Hold your breath at the peak</li>
                        <li>Breathe out as the circle contracts</li>
                        <li>Rest at the bottom</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getMeditationContent() {
        return `
        <div class="meditation-title-row">
          <span class="meditation-title">🧘‍♂️ Meditation Sessions</span>
                </div>
        <div class="meditation-timer" id="meditation-timer">05:00</div>
        <div class="session-buttons" id="session-buttons">
          <button class="session-btn" data-time="5">5 min</button>
          <button class="session-btn" data-time="10">10 min</button>
          <button class="session-btn" data-time="15">15 min</button>
          <button class="session-btn" data-time="custom" id="custom-btn">Custom</button>
                </div>
        <div class="custom-time-row" id="custom-time-row" style="display:none; margin-bottom:16px;">
          <input type="number" id="custom-minutes" min="1" max="60" placeholder="Enter minutes" class="custom-time-input">
          <button class="session-btn" id="set-custom-timer">Set</button>
                </div>
        <button class="start-session-btn" id="start-meditation">Start Session</button>
        <div class="meditation-instructions">
          Find a comfortable position and focus on your breath. Let thoughts come and go without judgment.
            </div>
        `;
    }

    getGratitudeContent() {
        return `
            <h3>📝 Gratitude Journal</h3>
            <div class="gratitude-journal">
                <div class="journal-prompt">
                    <p>What are you grateful for today?</p>
                </div>
                <textarea id="gratitude-entry" placeholder="Write about something you're grateful for..." rows="6"></textarea>
                <div class="journal-controls">
                    <button id="save-gratitude" class="btn btn-primary">Save Entry</button>
                    <button id="view-entries" class="btn btn-outline">View Past Entries</button>
                </div>
                <div id="gratitude-history" class="gratitude-history" style="display: none;"></div>
            </div>
        `;
    }

    getAffirmationsContent() {
        const affirmations = [
            "I am worthy of love and respect.",
            "I choose peace over worry.",
            "I am capable of handling whatever comes my way.",
            "I deserve happiness and joy.",
            "I am growing stronger every day.",
            "I trust in my ability to overcome challenges.",
            "I am grateful for this moment.",
            "I choose to focus on what I can control.",
            "I am enough, just as I am.",
            "I embrace change as an opportunity to grow."
        ];
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        return `
            <h3>✨ Daily Affirmations</h3>
            <div class="affirmations-display">
                <div class="affirmation-card">
                    <p id="current-affirmation">"${randomAffirmation}"</p>
                </div>
                <div class="affirmation-controls">
                    <button id="new-affirmation" class="btn btn-primary">New Affirmation</button>
                    <button id="save-affirmation" class="btn btn-outline">Save This One</button>
                    <button id="view-saved-affirmations" class="btn btn-outline">View Saved</button>
                </div>
                <div class="affirmation-instructions">
                    <p>Read this affirmation slowly and repeat it to yourself. Feel its truth.</p>
                </div>
                <div id="saved-affirmations-list" style="display:none;"></div>
            </div>
        `;
    }

    getMusicContent() {
        return `
            <h3>🎵 Soundscapes & Music</h3>
            <div class="music-player">
                <div class="timer-section">
                    <h4>Set Timer</h4>
                    <div class="timer-buttons">
                        <button class="timer-btn" data-minutes="5">5 min</button>
                        <button class="timer-btn" data-minutes="10">10 min</button>
                        <button class="timer-btn" data-minutes="15">15 min</button>
                        <button class="timer-btn" data-minutes="30">30 min</button>
                        <button class="timer-btn" data-minutes="60">1 hour</button>
                    </div>
                    <div class="custom-timer">
                        <input type="number" id="custom-minutes" placeholder="Custom minutes" min="1" max="120">
                        <button id="set-custom-timer" class="btn btn-outline">Set</button>
                    </div>
                    <div class="timer-display" id="music-timer" style="display: none;">00:00</div>
                </div>
                
                <div class="sound-selection">
                    <h4>Choose Your Sound</h4>
                    <div class="sound-grid">
                        <button class="sound-btn" data-sound="rain">🌧️ Rain</button>
                        <button class="sound-btn" data-sound="ocean">🌊 Ocean Waves</button>
                        <button class="sound-btn" data-sound="forest">🌲 Forest</button>
                        <button class="sound-btn" data-sound="birds">🐦 Birds</button>
                        <button class="sound-btn" data-sound="fire">🔥 Fireplace</button>
                        <button class="sound-btn" data-sound="wind">💨 Wind</button>
                    </div>
                </div>
                
                <div class="player-controls">
                    <button id="play-sound" class="btn btn-primary" disabled>Play</button>
                    <button id="stop-sound" class="btn btn-secondary" style="display: none;">Stop</button>
                </div>
            </div>
        `;
    }

    getExercisesContent() {
        return `
            <h3>🏃 Gentle Exercises</h3>
            <div class="exercise-session">
                <div class="exercise-selection">
                    <h4>Choose an Exercise</h4>
                    <div class="exercise-options">
                        <button class="exercise-btn"><span class="exercise-emoji">🤸</span> <span class="exercise-title">Stretching</span> <span class="exercise-duration">(5 min)</span></button>
                        <button class="exercise-btn"><span class="exercise-emoji">🚶</span> <span class="exercise-title">Walking in Place</span> <span class="exercise-duration">(10 min)</span></button>
                        <button class="exercise-btn"><span class="exercise-emoji">🧘</span> <span class="exercise-title">Simple Yoga</span> <span class="exercise-duration">(15 min)</span></button>
                    </div>
                </div>
                <div class="exercise-timer" id="exercise-timer" style="display: none;">
                    <div class="timer-display" id="exercise-time">05:00</div>
                    <div class="exercise-instructions" id="exercise-instructions"></div>
                    <div class="exercise-controls">
                        <button id="start-exercise" class="btn btn-primary">Start</button>
                        <button id="pause-exercise" class="btn btn-secondary" style="display: none;">Pause</button>
                        <button id="stop-exercise" class="btn btn-secondary" style="display: none;">Stop</button>
                    </div>
                </div>
            </div>
        `;
    }

    getVisualizationContent() {
        return `
            <h3>🌅 Guided Imagery & Visualization</h3>
            <div class="visualization-session">
                <div class="journey-selection">
                    <h4>Choose Your Journey</h4>
                    <div class="journey-options">
                        <button class="journey-btn" data-journey="beach">🏖️ Peaceful Beach</button>
                        <button class="journey-btn" data-journey="forest">🌲 Quiet Forest</button>
                        <button class="journey-btn" data-journey="mountain">⛰️ Mountain Peak</button>
                        <button class="journey-btn" data-journey="garden">🌸 Secret Garden</button>
                        <button class="journey-btn" data-journey="room">🏠 Cozy Room</button>
                    </div>
                </div>
                <div class="visualization-player" id="visualization-player" style="display: none;">
                    <div class="journey-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="journey-progress"></div>
                        </div>
                        <div class="journey-timer" id="journey-timer">5:00</div>
                    </div>
                    <div class="journey-text" id="journey-text"></div>
                    <div class="journey-controls">
                        <button id="start-journey" class="btn btn-primary">Start Journey</button>
                        <button id="pause-journey" class="btn btn-secondary" style="display: none;">Pause</button>
                        <button id="reset-journey" class="btn btn-outline">Reset</button>
                    </div>
                </div>
            </div>
        `;
    }

    getPsychologyContent() {
        return `
            <h3>🌟 Positive Psychology Exercises</h3>
            <div class="psychology-exercises">
                <div class="exercise-selection">
                    <h4>Choose an Exercise</h4>
                    <div class="psychology-options">
                        <button class="psychology-btn" data-exercise="three-good-things">✨ Three Good Things</button>
                        <button class="psychology-btn" data-exercise="best-self">🌟 Best Possible Self</button>
                        <button class="psychology-btn" data-exercise="gratitude-letter">💌 Gratitude Letter</button>
                        <button class="psychology-btn" data-exercise="strengths">💪 Character Strengths</button>
                        <button class="psychology-btn" data-exercise="kindness">❤️ Acts of Kindness</button>
                    </div>
                </div>
                <div class="psychology-content" id="psychology-content" style="display: none;"></div>
            </div>
        `;
    }

    initializeToolFunctionality(toolType) {
        // Initialize the specific functionality for the selected tool
        switch (toolType) {
            case 'breathing':
                this.initBreathingExercise();
                break;
            case 'meditation':
                this.initMeditationTimer();
                break;
            case 'gratitude':
                this.initGratitudeJournal();
                break;
            case 'affirmations':
                this.initAffirmations();
                break;
            case 'music':
                this.initMusicPlayer();
                break;
            case 'exercises':
                this.initExerciseTimer();
                break;
            case 'visualization':
                this.initVisualization();
                break;
            case 'psychology':
                this.initPsychologyExercises();
                break;
        }
    }

    initBreathingExercise() {
        // Initialize breathing exercise functionality (circle animation, timer)
        const startBtn = document.getElementById('start-breathing');
        const stopBtn = document.getElementById('stop-breathing');
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        let breathingInterval;
        let isBreathing = false;
        startBtn.addEventListener('click', () => {
            if (!isBreathing) {
                isBreathing = true;
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: rest
                const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Rest'];
                const durations = [4000, 2000, 4000, 2000]; // milliseconds
                function breathingCycle() {
                    text.textContent = phases[phase];
                    circle.className = `breathing-circle ${phase === 0 ? 'expand' : phase === 2 ? 'contract' : ''}`;
                    setTimeout(() => {
                        phase = (phase + 1) % 4;
                        if (isBreathing) {
                            breathingCycle();
                        }
                    }, durations[phase]);
                }
                breathingCycle();
            }
        });
        stopBtn.addEventListener('click', () => {
            isBreathing = false;
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            text.textContent = 'Ready';
            circle.className = 'breathing-circle';
        });
    }

    initMeditationTimer() {
        // Initialize meditation timer functionality (session selection, custom time, alarm)
        const timerBtns = document.querySelectorAll('.session-btn');
        const startBtn = document.getElementById('start-meditation');
        const timerDisplay = document.getElementById('meditation-timer');
        // Add alarm audio
        let alarmAudio = document.getElementById('meditation-alarm');
        if (!alarmAudio) {
            alarmAudio = document.createElement('audio');
            alarmAudio.id = 'meditation-alarm';
            alarmAudio.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5c7.mp3'; // pleasant bell sound
            alarmAudio.preload = 'auto';
            document.body.appendChild(alarmAudio);
        }
        let selectedTime = 5; // default 5 minutes
        let timeLeft = selectedTime * 60; // in seconds
        let timerInterval;
        let isRunning = false;
        // Custom session length
        const customInput = document.getElementById('custom-minutes');
        const setCustomBtn = document.getElementById('set-custom-timer');
        if (setCustomBtn && customInput) {
            setCustomBtn.addEventListener('click', () => {
                const minutes = parseInt(customInput.value);
                if (!isNaN(minutes) && minutes > 0 && minutes <= 60) {
                    selectedTime = minutes;
                    timeLeft = selectedTime * 60;
                    timerBtns.forEach(b => b.classList.remove('selected'));
                    setCustomBtn.classList.add('selected');
                    this.updateTimerDisplay(timerDisplay, timeLeft);
                } else {
                    alert('Please enter a valid number of minutes (1-60).');
                    customInput.value = '';
                    this.updateTimerDisplay(timerDisplay, selectedTime * 60);
                }
            });
        }
        timerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timerBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (setCustomBtn) setCustomBtn.classList.remove('selected');
                if (btn.dataset.time !== 'custom') {
                selectedTime = parseInt(btn.dataset.time);
                timeLeft = selectedTime * 60;
                this.updateTimerDisplay(timerDisplay, timeLeft);
                }
            });
        });
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.disabled = true;
                timerInterval = setInterval(() => {
                    timeLeft--;
                    this.updateTimerDisplay(timerDisplay, timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        isRunning = false;
                        startBtn.disabled = false;
                        alarmAudio.currentTime = 0;
                        alarmAudio.play();
                        alert('Meditation session complete! 🧘');
                        timeLeft = selectedTime * 60;
                        this.updateTimerDisplay(timerDisplay, timeLeft);
                    }
                }, 1000);
            }
        });
        // Custom time input toggle logic
        const customBtn = document.getElementById('custom-btn');
        const customRow = document.getElementById('custom-time-row');
        if (customBtn && customRow && timerBtns) {
            customBtn.addEventListener('click', () => {
                customRow.style.display = 'flex';
            });
            timerBtns.forEach(btn => {
                if (btn !== customBtn) {
                    btn.addEventListener('click', () => {
                        customRow.style.display = 'none';
                    });
                }
            });
        }
        // Set initial state
            this.updateTimerDisplay(timerDisplay, timeLeft);
        timerBtns[0].classList.add('selected');
    }

    updateTimerDisplay(element, seconds) {
        // Update the display of the timer (minutes:seconds)
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
            seconds = 5 * 60; // fallback to 5 minutes
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        element.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    initGratitudeJournal() {
        // Initialize gratitude journal functionality (saving entries, viewing history)
        const saveBtn = document.getElementById('save-gratitude');
        const viewBtn = document.getElementById('view-entries');
        const textarea = document.getElementById('gratitude-entry');
        const historyDiv = document.getElementById('gratitude-history');
        saveBtn.addEventListener('click', () => {
            const entry = textarea.value.trim();
            if (entry) {
                this.saveGratitudeEntry(entry);
                textarea.value = '';
                alert('Gratitude entry saved! 🙏');
            }
        });
        viewBtn.addEventListener('click', () => {
            const entries = this.getGratitudeEntries();
            if (entries.length > 0) {
                historyDiv.innerHTML = '<h4>Your Gratitude Entries</h4>' + 
                    entries.map(entry => `<div class="gratitude-entry"><small>${entry.date}</small><p>${entry.text}</p></div>`).join('');
                historyDiv.style.display = historyDiv.style.display === 'none' ? 'block' : 'none';
            } else {
                alert('No gratitude entries yet. Start writing!');
            }
        });
    }

    saveGratitudeEntry(text) {
        // Save a new gratitude entry to localStorage
        const entries = this.getGratitudeEntries();
        entries.push({
            text: text,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('gratitudeEntries', JSON.stringify(entries));
    }

    getGratitudeEntries() {
        // Retrieve all saved gratitude entries from localStorage
        return JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
    }

    initAffirmations() {
        // Initialize affirmation functionality (random generation, saving)
        const newBtn = document.getElementById('new-affirmation');
        const saveBtn = document.getElementById('save-affirmation');
        const viewBtn = document.getElementById('view-saved-affirmations');
        const affirmationText = document.getElementById('current-affirmation');
        const savedList = document.getElementById('saved-affirmations-list');
        const affirmations = [
            "I am worthy of love and respect.",
            "I choose peace over worry.",
            "I am capable of handling whatever comes my way.",
            "I deserve happiness and joy.",
            "I am growing stronger every day.",
            "I trust in my ability to overcome challenges.",
            "I am grateful for this moment.",
            "I choose to focus on what I can control.",
            "I am enough, just as I am.",
            "I embrace change as an opportunity to grow."
        ];
        newBtn.addEventListener('click', () => {
            const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
            affirmationText.textContent = `"${randomAffirmation}"`;
        });
        saveBtn.addEventListener('click', () => {
            const current = affirmationText.textContent;
            const saved = JSON.parse(localStorage.getItem('savedAffirmations') || '[]');
            if (!saved.includes(current)) {
                saved.push(current);
                localStorage.setItem('savedAffirmations', JSON.stringify(saved));
                alert('Affirmation saved! ✨');
            } else {
                alert('This affirmation is already saved!');
            }
        });
        viewBtn.addEventListener('click', () => {
            const saved = JSON.parse(localStorage.getItem('savedAffirmations') || '[]');
            if (saved.length === 0) {
                savedList.innerHTML = `<div class='affirmation-saved-list-card'><p style='text-align:center; color:#888; margin:0;'>No saved affirmations yet.</p></div><button id='close-saved-affirmations' class='btn btn-outline' style='margin-top:18px;'>Close</button>`;
            } else {
                savedList.innerHTML = `<div class='affirmation-saved-list-card'>${saved.map(a => `<div class='affirmation-saved-item'>${a}</div>`).join('')}</div><button id='close-saved-affirmations' class='btn btn-outline' style='margin-top:18px;'>Close</button>`;
            }
            savedList.style.display = 'block';
            document.getElementById('close-saved-affirmations').onclick = () => {
                savedList.style.display = 'none';
            };
        });
    }

    initMusicPlayer() {
        // Initialize music player functionality (timer, sound selection, alarm)
        const timerBtns = document.querySelectorAll('.timer-btn');
        const customInput = document.getElementById('custom-minutes');
        const setCustomBtn = document.getElementById('set-custom-timer');
        const soundBtns = document.querySelectorAll('.sound-btn');
        const playBtn = document.getElementById('play-sound');
        const stopBtn = document.getElementById('stop-sound');
        const timerDisplay = document.getElementById('music-timer');
        
        // Sound sources
        const soundSources = {
            rain: 'assets/816895__robert_gould__summer-rainstorm-with-thunder.wav',
            ocean: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            birds: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            fire: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            wind: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        };
        let audio = null;
        let musicTimer = null;
        let selectedMinutes = 0;
        let selectedSound = null;
        let timeLeft = 0;
        const fallbackSound = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7b7b.mp3'; // short, universal mp3
        
        timerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedMinutes = parseInt(btn.dataset.minutes);
                this.updatePlayButton();
            });
        });
        
        setCustomBtn.addEventListener('click', () => {
            const minutes = parseInt(customInput.value);
            if (minutes && minutes > 0 && minutes <= 120) {
                selectedMinutes = minutes;
                timerBtns.forEach(b => b.classList.remove('active'));
                this.updatePlayButton();
            }
        });
        
        soundBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                soundBtns.forEach(b => b.classList.remove('active', 'selected'));
                btn.classList.add('active', 'selected');
                selectedSound = btn.dataset.sound;
                this.updatePlayButton();
            });
        });
        
        playBtn.addEventListener('click', () => {
            if (selectedMinutes && selectedSound) {
                // Stop any previous audio
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    audio = null;
                }
                let src = soundSources[selectedSound] || fallbackSound;
                audio = new Audio(src);
                audio.loop = true;
                let played = false;
                audio.oncanplay = () => {
                    if (!played) {
                        audio.play().then(() => {
                            showToast('🔊 Playing: ' + selectedSound.charAt(0).toUpperCase() + selectedSound.slice(1));
                        }).catch((err) => {
                            showToast('❌ Unable to play sound. Tap Play again or check your browser settings.');
                        });
                        played = true;
                    }
                };
                audio.onerror = () => {
                    if (audio.src !== fallbackSound) {
                        showToast('❌ Failed to load sound. Trying fallback...');
                        audio.src = fallbackSound;
                        audio.load();
                    } else {
                        showToast('❌ Audio playback failed.');
                    }
                };
                audio.load();
                timeLeft = selectedMinutes * 60;
                timerDisplay.style.display = 'block';
                playBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                musicTimer = setInterval(() => {
                    timeLeft--;
                    this.updateTimerDisplay(timerDisplay, timeLeft);
                    if (timeLeft <= 0) {
                        this.stopMusic();
                        showToast('🎵 Music session complete!');
                    }
                }, 1000);
                this.updateTimerDisplay(timerDisplay, timeLeft);
            }
        });
        
        stopBtn.addEventListener('click', () => {
            this.stopMusic();
        });
        
        this.updatePlayButton = () => {
            playBtn.disabled = !(selectedMinutes && selectedSound);
        };
        
        this.stopMusic = () => {
            if (musicTimer) {
                clearInterval(musicTimer);
                musicTimer = null;
            }
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                audio = null;
            }
            timerDisplay.style.display = 'none';
            playBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        };
    }

    initExerciseTimer() {
        // Initialize gentle exercise timer functionality (exercise selection, timer, controls)
        const exerciseBtns = document.querySelectorAll('.exercise-btn');
        const exerciseTimer = document.getElementById('exercise-timer');
        const timeDisplay = document.getElementById('exercise-time');
        const instructions = document.getElementById('exercise-instructions');
        // Use existing timer controls from HTML
        const startBtn = document.getElementById('start-exercise');
        const pauseBtn = document.getElementById('pause-exercise');
        const stopBtn = document.getElementById('stop-exercise');
        let selectedExercise = null;
        let exerciseInterval = null;
        let timeLeft = 0;
        let isRunning = false;
        const exercises = {
            'Stretching': { duration: 5, instructions: "Gentle stretching movements for 5 minutes" },
            'Walking in Place': { duration: 10, instructions: "Walk in place at a comfortable pace for 10 minutes" },
            'Simple Yoga': { duration: 15, instructions: "Simple yoga poses and movements for 15 minutes" }
        };
        exerciseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                exerciseBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedExercise = btn.querySelector('.exercise-title').textContent.trim();
                const exercise = exercises[selectedExercise];
                timeLeft = exercise.duration * 60;
                instructions.textContent = exercise.instructions;
                this.updateTimerDisplay(timeDisplay, timeLeft);
                exerciseTimer.style.display = 'block';
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
                startBtn.textContent = 'Start';
            });
        });
        startBtn.addEventListener('click', () => {
            if (!isRunning && selectedExercise) {
                isRunning = true;
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
                stopBtn.style.display = 'inline-block';
                exerciseInterval = setInterval(() => {
                    timeLeft--;
                    this.updateTimerDisplay(timeDisplay, timeLeft);
                    if (timeLeft <= 0) {
                        this.stopExercise();
                        alert('Exercise complete! Great job! 💪');
                    }
                }, 1000);
            }
        });
        pauseBtn.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(exerciseInterval);
                isRunning = false;
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                startBtn.textContent = 'Resume';
            }
        });
        stopBtn.addEventListener('click', () => {
            this.stopExercise();
        });
        this.stopExercise = () => {
            if (exerciseInterval) {
                clearInterval(exerciseInterval);
                exerciseInterval = null;
            }
            isRunning = false;
            if (selectedExercise) {
                timeLeft = exercises[selectedExercise].duration * 60;
                this.updateTimerDisplay(timeDisplay, timeLeft);
            }
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            startBtn.textContent = 'Start';
        };
    }

    initVisualization() {
        // Initialize guided imagery and visualization functionality (journey selection, player)
        const journeyBtns = document.querySelectorAll('.journey-btn');
        const player = document.getElementById('visualization-player');
        const progressBar = document.getElementById('journey-progress');
        const timer = document.getElementById('journey-timer');
        const journeyText = document.getElementById('journey-text');
        const startBtn = document.getElementById('start-journey');
        const pauseBtn = document.getElementById('pause-journey');
        const resetBtn = document.getElementById('reset-journey');
        
        let selectedJourney = null;
        let journeyInterval = null;
        let currentStep = 0;
        let isPlaying = false;
        
        const journeys = {
            beach: [
                "Close your eyes and imagine yourself on a peaceful beach...",
                "Feel the warm sand beneath your feet...",
                "Listen to the gentle waves lapping at the shore...",
                "Feel the warm sun on your skin...",
                "Take a deep breath of the fresh ocean air...",
                "Let all your worries wash away with the waves..."
            ],
            forest: [
                "You find yourself in a quiet, peaceful forest...",
                "Tall trees surround you, their leaves rustling gently...",
                "Sunlight filters through the canopy above...",
                "You hear the soft sounds of nature around you...",
                "Feel the cool, fresh air filling your lungs...",
                "You are completely safe and at peace here..."
            ],
            mountain: [
                "You stand atop a beautiful mountain peak...",
                "The view stretches endlessly before you...",
                "Feel the crisp, clean mountain air...",
                "You are above the clouds, in perfect serenity...",
                "The silence is profound and healing...",
                "You feel a deep sense of accomplishment and peace..."
            ],
            garden: [
                "You discover a hidden, magical garden...",
                "Beautiful flowers bloom all around you...",
                "The air is filled with sweet, natural fragrances...",
                "Butterflies dance from flower to flower...",
                "You feel completely safe in this secret place...",
                "This garden is yours, a place of perfect peace..."
            ],
            room: [
                "You enter your perfect, cozy room...",
                "Everything here brings you comfort and joy...",
                "Soft lighting creates a warm, welcoming atmosphere...",
                "You settle into the most comfortable spot...",
                "All your favorite things surround you...",
                "You are completely relaxed and at home..."
            ]
        };
        
        journeyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                journeyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedJourney = btn.dataset.journey;
                currentStep = 0;
                
                player.style.display = 'block';
                journeyText.textContent = "Ready to begin your journey...";
                progressBar.style.width = '0%';
                timer.textContent = '5:00';
            });
        });
        
        startBtn.addEventListener('click', () => {
            if (selectedJourney && !isPlaying) {
                isPlaying = true;
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
                
                const steps = journeys[selectedJourney];
                const stepDuration = 50000 / steps.length; // 50 seconds total
                
                function playStep() {
                    if (currentStep < steps.length && isPlaying) {
                        journeyText.textContent = steps[currentStep];
                        const progress = ((currentStep + 1) / steps.length) * 100;
                        progressBar.style.width = progress + '%';
                        
                        currentStep++;
                        setTimeout(playStep, stepDuration);
                    } else if (isPlaying) {
                        // Journey complete
                        journeyText.textContent = "Your journey is complete. Take a moment to appreciate this peaceful feeling.";
                        isPlaying = false;
                        startBtn.style.display = 'inline-block';
                        pauseBtn.style.display = 'none';
                        startBtn.textContent = 'Start Again';
                    }
                }
                
                playStep();
            }
        });
        
        pauseBtn.addEventListener('click', () => {
            isPlaying = false;
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            startBtn.textContent = 'Continue';
        });
        
        resetBtn.addEventListener('click', () => {
            isPlaying = false;
            currentStep = 0;
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            startBtn.textContent = 'Start Journey';
            journeyText.textContent = "Ready to begin your journey...";
            progressBar.style.width = '0%';
        });
    }

    initPsychologyExercises() {
        // Initialize positive psychology exercises functionality (exercise selection, content, form)
        const exerciseBtns = document.querySelectorAll('.psychology-btn');
        const content = document.getElementById('psychology-content');
        
        exerciseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                exerciseBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const exercise = btn.dataset.exercise;
                content.innerHTML = this.getPsychologyExerciseContent(exercise);
                content.style.display = 'block';
                this.initPsychologyExercise(exercise);
            });
        });
    }

    getPsychologyExerciseContent(exercise) {
        // Return the HTML for a specific positive psychology exercise
        const exercises = {
            'three-good-things': {
                title: '✨ Three Good Things',
                description: 'Each day for a week, write down three things that went well and explain why you think they went well.',
                form: `
                    <div class="psychology-form">
                        <div class="form-group">
                            <label>Good Thing #1:</label>
                            <textarea placeholder="What went well today?"></textarea>
                            <textarea placeholder="Why do you think this went well?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Good Thing #2:</label>
                            <textarea placeholder="What went well today?"></textarea>
                            <textarea placeholder="Why do you think this went well?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Good Thing #3:</label>
                            <textarea placeholder="What went well today?"></textarea>
                            <textarea placeholder="Why do you think this went well?"></textarea>
                        </div>
                        <button class="btn btn-primary save-exercise">Save Entry</button>
                    </div>
                `
            },
            'best-self': {
                title: '🌟 Best Possible Self',
                description: 'Imagine yourself in the future, having achieved all your goals. Write about this ideal version of yourself.',
                form: `
                    <div class="psychology-form">
                        <div class="form-group">
                            <label>Describe your best possible self:</label>
                            <textarea rows="8" placeholder="Imagine yourself 5-10 years from now, having achieved your goals. What does your life look like? What have you accomplished? How do you feel?"></textarea>
                        </div>
                        <button class="btn btn-primary save-exercise">Save Reflection</button>
                    </div>
                `
            },
            'gratitude-letter': {
                title: '💌 Gratitude Letter',
                description: 'Write a letter to someone who has been kind to you but whom you have never properly thanked.',
                form: `
                    <div class="psychology-form">
                        <div class="form-group">
                            <label>Person you\'re grateful to:</label>
                            <input type="text" placeholder="Name of the person">
                        </div>
                        <div class="form-group">
                            <label>Your gratitude letter:</label>
                            <textarea rows="10" placeholder="Dear [Name], I am writing to express my gratitude for..."></textarea>
                        </div>
                        <button class="btn btn-primary save-exercise">Save Letter</button>
                    </div>
                `
            },
            'strengths': {
                title: '💪 Character Strengths',
                description: 'Identify your top character strengths and think about how you can use them more in your daily life.',
                form: `
                    <div class="psychology-form">
                        <div class="strengths-list">
                            <h4>Common Character Strengths:</h4>
                            <div class="strengths-grid">
                                <label><input type="checkbox" value="creativity"> Creativity</label>
                                <label><input type="checkbox" value="curiosity"> Curiosity</label>
                                <label><input type="checkbox" value="judgment"> Good Judgment</label>
                                <label><input type="checkbox" value="love-of-learning"> Love of Learning</label>
                                <label><input type="checkbox" value="perspective"> Perspective</label>
                                <label><input type="checkbox" value="bravery"> Bravery</label>
                                <label><input type="checkbox" value="perseverance"> Perseverance</label>
                                <label><input type="checkbox" value="honesty"> Honesty</label>
                                <label><input type="checkbox" value="zest"> Zest</label>
                                <label><input type="checkbox" value="love"> Love</label>
                                <label><input type="checkbox" value="kindness"> Kindness</label>
                                <label><input type="checkbox" value="social-intelligence"> Social Intelligence</label>
                                <label><input type="checkbox" value="teamwork"> Teamwork</label>
                                <label><input type="checkbox" value="fairness"> Fairness</label>
                                <label><input type="checkbox" value="leadership"> Leadership</label>
                                <label><input type="checkbox" value="forgiveness"> Forgiveness</label>
                                <label><input type="checkbox" value="humility"> Humility</label>
                                <label><input type="checkbox" value="prudence"> Prudence</label>
                                <label><input type="checkbox" value="self-regulation"> Self-Regulation</label>
                                <label><input type="checkbox" value="appreciation"> Appreciation of Beauty</label>
                                <label><input type="checkbox" value="gratitude"> Gratitude</label>
                                <label><input type="checkbox" value="hope"> Hope</label>
                                <label><input type="checkbox" value="humor"> Humor</label>
                                <label><input type="checkbox" value="spirituality"> Spirituality</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>How can you use your top strengths more?</label>
                            <textarea rows="5" placeholder="Think about ways to apply your strengths in daily life..."></textarea>
                        </div>
                        <button class="btn btn-primary save-exercise">Save Strengths</button>
                    </div>
                `
            },
            'kindness': {
                title: '❤️ Acts of Kindness',
                description: 'Plan and perform acts of kindness, then reflect on how they made you feel.',
                form: `
                    <div class="psychology-form">
                        <div class="form-group">
                            <label>Planned acts of kindness:</label>
                            <textarea rows="4" placeholder="What kind acts do you plan to do this week?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Acts of kindness completed:</label>
                            <textarea rows="4" placeholder="What kind acts did you complete?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>How did performing these acts make you feel?</label>
                            <textarea rows="4" placeholder="Reflect on your emotions and thoughts..."></textarea>
                        </div>
                        <button class="btn btn-primary save-exercise">Save Reflection</button>
                    </div>
                `
            }
        };
        
        const ex = exercises[exercise];
        return `
            <h4>${ex.title}</h4>
            <p>${ex.description}</p>
            ${ex.form}
        `;
    }

    initPsychologyExercise(exercise) {
        // Initialize the specific functionality for a positive psychology exercise (saving data)
        const saveBtn = document.querySelector('.save-exercise');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Save the exercise data
                const formData = this.collectPsychologyFormData(exercise);
                this.savePsychologyExercise(exercise, formData);
                alert('Exercise saved! 🌟');
            });
        }
    }

    collectPsychologyFormData(exercise) {
        // Collect data from the psychology exercise form
        const form = document.querySelector('.psychology-form');
        const data = { exercise, date: new Date().toLocaleDateString() };
        
        // Collect text inputs and textareas
        const inputs = form.querySelectorAll('input[type="text"], textarea');
        inputs.forEach((input, index) => {
            data[`field_${index}`] = input.value;
        });
        
        // Collect checkboxes for strengths exercise
        if (exercise === 'strengths') {
            const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
            data.selectedStrengths = Array.from(checkboxes).map(cb => cb.value);
        }
        
        return data;
    }

    savePsychologyExercise(exercise, data) {
        // Save a positive psychology exercise entry to localStorage
        const exercises = JSON.parse(localStorage.getItem('psychologyExercises') || '[]');
        exercises.push(data);
        localStorage.setItem('psychologyExercises', JSON.stringify(exercises));
    }

    closeModal() {
        // Close the current tool modal
        const modal = document.getElementById('tool-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Clean up any running timers or intervals for the closed tool
        if (this.currentTool) {
            this.cleanupTool(this.currentTool);
        }
        
        this.currentTool = null;
    }

    cleanupTool(toolType) {
        // Clean up any running intervals or timers for a specific tool type
        switch (toolType) {
            case 'meditation':
                if (this.stopMeditation) this.stopMeditation();
                break;
            case 'music':
                if (this.stopMusic) this.stopMusic();
                break;
            case 'exercises':
                if (this.stopExercise) this.stopExercise();
                break;
        }
    }

    // Mood tracking functionality
    loadMoodHistory() {
        // Load mood history from localStorage
        return JSON.parse(localStorage.getItem('moodHistory') || '[]');
    }

    // Chat functionality
    loadChatHistory() {
        // Load chat history from localStorage
        return JSON.parse(localStorage.getItem('chatHistory') || '[]');
    }

    // Mood Tracking System (from app_broken.js)
    setupMoodTracking() {
        // Set up mood tracking functionality (mood selection, saving, chart rendering)
        const moodOptions = document.querySelectorAll('.mood-option');
        const moodNotes = document.getElementById('mood-notes');
        const saveMoodBtn = document.getElementById('save-mood');
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                moodOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.currentMood = option.dataset.mood;
            });
        });
        saveMoodBtn?.addEventListener('click', () => {
            this.saveMoodEntry();
        });
        this.renderMoodChart();
        this.updateMoodStats();
    }
    saveMoodEntry() {
        // Save a new mood entry to localStorage
        if (!this.currentMood) {
            alert('Please select a mood first!');
            return;
        }
        const moodNotes = document.getElementById('mood-notes');
        const entry = {
            mood: this.currentMood,
            notes: moodNotes.value,
            date: new Date().toLocaleDateString()
        };
        this.moodHistory.push(entry);
        localStorage.setItem('moodHistory', JSON.stringify(this.moodHistory));
        this.renderMoodChart();
        this.updateMoodStats();
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
        moodNotes.value = '';
        this.currentMood = null;
        alert('Mood entry saved successfully!');
    }
    renderMoodChart() {
        // Render the mood chart using Chart.js
        const canvas = document.getElementById('mood-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (this.moodChart) {
            this.moodChart.destroy();
        }
        // Prepare last 7 days data
        const last7Days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString();
            // Find mood entries for this day
            const dayEntries = this.moodHistory.filter(entry => entry.date === dateStr);
            let avgMood = 0;
            if (dayEntries.length > 0) {
                const moodValues = { struggling: 1, low: 2, angry: 3, good: 4, excellent: 5 };
                const total = dayEntries.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
                avgMood = total / dayEntries.length;
            }
            last7Days.push({ date: dateStr, mood: avgMood });
        }
        this.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [{
                    label: 'Mood Level',
                    data: last7Days.map(d => d.mood),
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167,139,250,0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#38bdf8',
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const moods = ['', 'Struggling', 'Low', 'Angry', 'Good', 'Excellent'];
                                return moods[value] || '';
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    updateMoodStats() {
        // Update mood statistics display (streak, average mood, total entries)
        const streakCount = document.getElementById('streak-count');
        const avgMood = document.getElementById('avg-mood');
        const totalEntries = document.getElementById('total-entries');
        if (totalEntries) totalEntries.textContent = this.moodHistory.length;
        if (this.moodHistory.length > 0) {
            // Calculate average mood
            const moodValues = { struggling: 1, low: 2, angry: 3, good: 4, excellent: 5 };
            const total = this.moodHistory.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
            const average = (total / this.moodHistory.length).toFixed(1);
            if (avgMood) {
                const moodLabels = { 1: 'Struggling', 2: 'Low', 3: 'Angry', 4: 'Good', 5: 'Excellent' };
                avgMood.textContent = moodLabels[Math.round(average)] || 'N/A';
            }
        } else {
            if (avgMood) avgMood.textContent = '-';
        }
        if (streakCount) streakCount.textContent = this.calculateMoodStreak();
    }
    calculateMoodStreak() {
        // Calculate the current mood streak (consecutive days with a mood entry)
        if (this.moodHistory.length === 0) return 0;
        // Sort entries by date descending
        const sorted = [...this.moodHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let prevDate = new Date();
        for (const entry of sorted) {
            const entryDate = new Date(entry.date);
            if (
                entryDate.getDate() === prevDate.getDate() &&
                entryDate.getMonth() === prevDate.getMonth() &&
                entryDate.getFullYear() === prevDate.getFullYear()
            ) {
                streak++;
                prevDate.setDate(prevDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }
    // Mood History Modal Logic
    setupMoodHistoryModal() {
        // Set up the logic for the mood history modal (opening, closing, editing, deleting)
        const modal = document.getElementById('mood-history-modal');
        const openBtn = document.getElementById('view-mood-history');
        const closeBtn = document.getElementById('close-mood-history');
        const listDiv = document.getElementById('mood-history-list');
        if (!modal || !openBtn || !closeBtn || !listDiv) return;
        openBtn.onclick = () => {
            this.renderMoodHistoryList();
            modal.style.display = 'flex';
        };
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        window.onclick = (event) => {
            if (event.target === modal) modal.style.display = 'none';
        };
    }
    renderMoodHistoryList() {
        // Render the list of mood entries in the history modal
        const listDiv = document.getElementById('mood-history-list');
        if (!listDiv) return;
        if (this.moodHistory.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center; color:#7c6fc7;">No mood entries yet.</p>';
            return;
        }
        listDiv.innerHTML = '';
        this.moodHistory.forEach((entry, idx) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'mood-history-entry';
            entryDiv.innerHTML = `
                <div class="mood-label">${this.capitalize(entry.mood)}</div>
                <div class="mood-date">${entry.date}</div>
                <div class="mood-notes">${entry.notes ? entry.notes : '<em>No notes</em>'}</div>
                <div class="mood-history-actions">
                    <button class="mood-history-edit">Edit</button>
                    <button class="mood-history-delete">Delete</button>
                </div>
            `;
            // Edit
            entryDiv.querySelector('.mood-history-edit').onclick = () => {
                this.editMoodEntry(idx);
            };
            // Delete
            entryDiv.querySelector('.mood-history-delete').onclick = () => {
                if (confirm('Delete this mood entry?')) {
                    this.moodHistory.splice(idx, 1);
                    localStorage.setItem('moodHistory', JSON.stringify(this.moodHistory));
                    this.renderMoodHistoryList();
                    this.renderMoodChart();
                    this.updateMoodStats();
                }
            };
            listDiv.appendChild(entryDiv);
        });
    }
    editMoodEntry(idx) {
        // Open the edit form for a specific mood entry
        const entry = this.moodHistory[idx];
        const listDiv = document.getElementById('mood-history-list');
        if (!entry || !listDiv) return;
        // Render edit form
        listDiv.innerHTML = `
            <div class="mood-history-entry">
                <label style="font-weight:600;">Mood:</label>
                <select id="edit-mood">
                    <option value="excellent" ${entry.mood==='excellent'?'selected':''}>Excellent</option>
                    <option value="good" ${entry.mood==='good'?'selected':''}>Good</option>
                    <option value="angry" ${entry.mood==='angry'?'selected':''}>Angry</option>
                    <option value="low" ${entry.mood==='low'?'selected':''}>Low</option>
                    <option value="struggling" ${entry.mood==='struggling'?'selected':''}>Struggling</option>
                </select>
                <label style="font-weight:600; margin-top:0.7rem;">Notes:</label>
                <textarea id="edit-notes" rows="3">${entry.notes||''}</textarea>
                <div style="margin-top:1rem; display:flex; gap:0.7rem;">
                    <button class="mood-history-edit" id="save-edit">Save</button>
                    <button class="mood-history-delete" id="cancel-edit">Cancel</button>
                </div>
            </div>
        `;
        document.getElementById('save-edit').onclick = () => {
            const newMood = document.getElementById('edit-mood').value;
            const newNotes = document.getElementById('edit-notes').value;
            this.moodHistory[idx].mood = newMood;
            this.moodHistory[idx].notes = newNotes;
            localStorage.setItem('moodHistory', JSON.stringify(this.moodHistory));
            this.renderMoodHistoryList();
            this.renderMoodChart();
            this.updateMoodStats();
        };
        document.getElementById('cancel-edit').onclick = () => {
            this.renderMoodHistoryList();
        };
    }
    capitalize(str) {
        // Helper to capitalize the first letter of a string
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // Page initialization methods
    initLanding() {
        // Initialize the landing page specific functionality (e.g., console log)
        console.log('Landing page initialized');
    }

    initMoodCheck() {
        // Initialize the mood check page specific functionality (mood tracking, history modal)
        this.setupMoodTracking();
        this.setupMoodHistoryModal();
    }

    initEmergency() {
        // Initialize the emergency page specific functionality (e.g., console log)
        console.log('Emergency page initialized');
    }

    initBlog() {
        // Initialize the blog page specific functionality (e.g., console log)
        console.log('Blog page initialized');
    }

    initPrivacy() {
        // Initialize the privacy page specific functionality (e.g., console log)
        console.log('Privacy page initialized');
    }

    initInstitutional() {
        // Initialize the institutional page specific functionality (e.g., console log)
        console.log('Institutional page initialized');
    }

    initPricing() {
        // Initialize the pricing page specific functionality (e.g., console log)
        console.log('Pricing page initialized');
    }
}

// --- Streak and Badge Persistence ---
// Save streak and last entry date to localStorage
CalmConnectApp.prototype.saveStreakData = function(streak, lastDate) {
  localStorage.setItem('moodStreak', streak);
  localStorage.setItem('moodLastDate', lastDate);
};
// Load streak and last entry date from localStorage
CalmConnectApp.prototype.loadStreakData = function() {
  return {
    streak: parseInt(localStorage.getItem('moodStreak') || '0'),
    lastDate: localStorage.getItem('moodLastDate') || null
  };
};
// Override saveMoodEntry to update streak and badges in localStorage
const origSaveMoodEntry2 = CalmConnectApp.prototype.saveMoodEntry;
CalmConnectApp.prototype.saveMoodEntry = function() {
  // Get today's date (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  let { streak, lastDate } = this.loadStreakData();
  if (lastDate) {
    const last = new Date(lastDate);
    const diff = Math.floor((today - last) / (1000*60*60*24));
    if (diff === 1) {
      streak += 1;
    } else if (diff > 1) {
      streak = 1;
    } // else same day, streak unchanged
  } else {
    streak = 1;
  }
  this.saveStreakData(streak, todayStr);
  origSaveMoodEntry2.apply(this, arguments);
  // Update streak display immediately
  const streakCount = document.getElementById('streak-count');
  if (streakCount) streakCount.textContent = streak;
  // Animate streak
  if (streakCount) {
    streakCount.classList.add('streak-pop');
    setTimeout(()=>streakCount.classList.remove('streak-pop'), 700);
  }
};
// Override calculateMoodStreak to use localStorage
CalmConnectApp.prototype.calculateMoodStreak = function() {
  return parseInt(localStorage.getItem('moodStreak') || '0');
};
// --- Badge Persistence ---
// Already handled in badge logic in mood-check.html
// --- Streak Animation CSS ---
// Add this to your CSS:
// .streak-pop { animation: streakPop 0.7s cubic-bezier(.7,-0.2,.7,1.5); }
// @keyframes streakPop { 0%{transform:scale(1);} 30%{transform:scale(1.18);} 60%{transform:scale(0.95);} 100%{transform:scale(1);} }

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Create global app instance
    if (!window.calmConnectApp) {
        window.calmConnectApp = new CalmConnectApp();
    }
    
    // Determine current page and initialize accordingly
    const currentPage = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    
    switch (currentPage) {
        case "index":
            window.calmConnectApp.initLanding();
            break;
        case "mood-check":
            window.calmConnectApp.initMoodCheck();
            break;
        case "chatbot":
            // Removed all old chatbot UI logic (initChatbot, appendUserMessage, appendBotMessage, getBotReply)
            break;
        case "self-care":
            window.calmConnectApp.initSelfCare();
            break;
        case "emergency":
            window.calmConnectApp.initEmergency();
            break;
        case "blog":
            window.calmConnectApp.initBlog();
            break;
        case "privacy":
            window.calmConnectApp.initPrivacy();
            break;
        case "institutional":
            window.calmConnectApp.initInstitutional();
            break;
        case "pricing":
            window.calmConnectApp.initPricing();
            break;
        default:
            // Default to landing page initialization
            window.calmConnectApp.initLanding();
            break;
    }
});

// Patch for showToast (if not present)
if (typeof showToast !== 'function') {
  window.showToast = function(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(()=>toast.style.display='none', 300);
    }, 2500);
  };
}

