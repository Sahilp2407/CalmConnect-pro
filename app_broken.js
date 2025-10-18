// CalmConnect App JavaScript
class CalmConnectApp {
    constructor() {
        this.currentMood = null;
        this.moodHistory = this.loadMoodHistory();
        this.chatHistory = this.loadChatHistory();
        this.currentTool = null;
        this.moodChart = null;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMoodTracking();
        this.setupChatbot();
        this.setupSelfCareTools();
        this.setupEmergencySupport();
        this.setupPrivacyControls();
        this.setupScrollEffects();
        this.loadYouTubeVideos();
        this.renderMoodChart();
        this.updateMoodStats();
    }

    // Navigation System
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavLink();
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Mood Tracking System
    setupMoodTracking() {
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
    }

    saveMoodEntry() {
        if (!this.currentMood) {
            this.showNotification('Please select a mood first!', 'warning');
            return;
        }

        const moodNotes = document.getElementById('mood-notes');
        const entry = {
            mood: this.currentMood,
            notes: moodNotes.value,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.moodHistory.push(entry);
        this.saveMoodHistory();
        this.renderMoodChart();
        this.updateMoodStats();
        
        // Reset form
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
        moodNotes.value = '';
        this.currentMood = null;

        this.showNotification('Mood entry saved successfully!', 'success');
    }

    loadMoodHistory() {
        const saved = localStorage.getItem('calmconnect_mood_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveMoodHistory() {
        localStorage.setItem('calmconnect_mood_history', JSON.stringify(this.moodHistory));
    }

    renderMoodChart() {
        const canvas = document.getElementById('mood-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.moodChart) {
            this.moodChart.destroy();
        }

        // Prepare data for last 7 days
        const last7Days = this.getLast7DaysData();
        
        this.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [{
                    label: 'Mood Level',
                    data: last7Days.map(d => d.mood),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const moods = ['', 'Struggling', 'Low', 'Okay', 'Good', 'Excellent'];
                                return moods[value];
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    getLast7DaysData() {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Find mood entries for this day
            const dayEntries = this.moodHistory.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === date.toDateString();
            });
            
            // Calculate average mood for the day
            let avgMood = 0;
            if (dayEntries.length > 0) {
                const moodValues = { struggling: 1, low: 2, okay: 3, good: 4, excellent: 5 };
                const total = dayEntries.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
                avgMood = total / dayEntries.length;
            }
            
            days.push({ date: dateStr, mood: avgMood });
        }
        
        return days;
    }

    updateMoodStats() {
        const streakCount = document.getElementById('streak-count');
        const avgMood = document.getElementById('avg-mood');
        const totalEntries = document.getElementById('total-entries');

        if (totalEntries) {
            totalEntries.textContent = this.moodHistory.length;
        }

        if (this.moodHistory.length > 0) {
            // Calculate average mood
            const moodValues = { struggling: 1, low: 2, okay: 3, good: 4, excellent: 5 };
            const total = this.moodHistory.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
            const average = (total / this.moodHistory.length).toFixed(1);
            
            if (avgMood) {
                const moodLabels = { 1: 'Struggling', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Excellent' };
                avgMood.textContent = moodLabels[Math.round(average)] || 'N/A';
            }

            // Calculate streak
            const streak = this.calculateMoodStreak();
            if (streakCount) {
                streakCount.textContent = streak;
            }
        }
    }

    calculateMoodStreak() {
        if (this.moodHistory.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) { // Check last 30 days
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            
            const hasEntry = this.moodHistory.some(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === checkDate.toDateString();
            });
            
            if (hasEntry) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Chatbot System
    setupChatbot() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-message');
        const quickBtns = document.querySelectorAll('.quick-btn');

        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
        });

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                this.sendMessage(message);
            });
        });
    }

    sendMessage(message = null) {
        const chatInput = document.getElementById('chat-input');
        const messageText = message || chatInput.value.trim();
        
        if (!messageText) return;

        // Add user message
        this.addMessage(messageText, 'user');
        
        // Clear input
        if (chatInput) chatInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = this.generateBotResponse(messageText);
            this.addMessage(response, 'bot');
        }, 1000);
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Save to chat history if enabled
        const saveChatHistory = document.getElementById('save-chat-history');
        if (saveChatHistory?.checked) {
            this.chatHistory.push({ text, sender, timestamp: Date.now() });
            this.saveChatHistory();
        }
    }

    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Anxiety responses
        if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried')) {
            return "I understand you're feeling anxious. Let's try a simple breathing exercise: Breathe in for 4 counts, hold for 4, then breathe out for 6. Would you like me to guide you through some calming techniques?";
        }
        
        // Motivation responses
        if (message.includes('motivation') || message.includes('motivated') || message.includes('energy')) {
            return "You're taking a positive step by reaching out! Remember, small progress is still progress. What's one small thing you could do today that would make you feel accomplished?";
        }
        
        // Relaxation responses
        if (message.includes('relax') || message.includes('stress') || message.includes('calm')) {
            return "Let's work on relaxation together. Try the 5-4-3-2-1 technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This helps ground you in the present moment.";
        }
        
        // Sleep responses
        if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
            return "Sleep is so important for mental health. Try creating a bedtime routine: dim the lights, avoid screens 1 hour before bed, and practice some gentle stretching or meditation. Would you like some specific sleep hygiene tips?";
        }
        
        // Sadness responses
        if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
            return "I hear that you're going through a difficult time. Your feelings are valid, and it's okay to not be okay sometimes. Have you tried journaling about your feelings or reaching out to someone you trust?";
        }
        
        // Default supportive responses
        const defaultResponses = [
            "Thank you for sharing that with me. How are you feeling right now in this moment?",
            "I'm here to support you. What would be most helpful for you today?",
            "That sounds challenging. Remember that seeking help is a sign of strength, not weakness.",
            "You're not alone in this journey. What self-care activities usually help you feel better?",
            "I appreciate you opening up. Would you like to explore some coping strategies together?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    loadChatHistory() {
        const saved = localStorage.getItem('calmconnect_chat_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveChatHistory() {
        localStorage.setItem('calmconnect_chat_history', JSON.stringify(this.chatHistory));
    }

    // Self-Care Tools
    setupSelfCareTools() {
        const toolCards = document.querySelectorAll('.tool-card');
        const modal = document.getElementById('tool-modal');
        const closeBtn = modal?.querySelector('.close');

        toolCards.forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.openSelfCareTool(tool);
            });
        });

        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    openSelfCareTool(tool) {
        const modal = document.getElementById('tool-modal');
        const content = document.getElementById('tool-content');
        
        if (!modal || !content) return;

        let toolContent = '';

        switch (tool) {
            case 'breathing':
                toolContent = this.getBreathingExerciseContent();
                break;
            case 'meditation':
                toolContent = this.getMeditationContent();
                break;
            case 'journal':
                toolContent = this.getJournalContent();
                break;
            case 'affirmations':
                toolContent = this.getAffirmationsContent();
                break;
            case 'music':
                toolContent = this.getMusicContent();
                break;
            case 'exercises':
                toolContent = this.getExercisesContent();
                break;
        }

        content.innerHTML = toolContent;
        modal.style.display = 'block';
        this.currentTool = tool;
        
        // Initialize tool-specific functionality
        this.initializeToolFunctionality(tool);
    }

    getBreathingExerciseContent() {
        return `
            <h2>Guided Breathing Exercise</h2>
            <div class="breathing-exercise">
                <div class="breathing-circle" id="breathing-circle">
                    <div class="breathing-text" id="breathing-text">Click Start</div>
                </div>
                <div class="breathing-controls">
                    <button class="btn btn-primary" id="start-breathing">Start Exercise</button>
                    <button class="btn btn-secondary" id="stop-breathing" style="display: none;">Stop</button>
                </div>
                <div class="breathing-instructions">
                    <p>Follow the circle as it expands and contracts:</p>
                    <ul>
                        <li>Breathe in as the circle grows</li>
                        <li>Hold your breath at the peak</li>
                        <li>Breathe out as the circle shrinks</li>
                    </ul>
                </div>
            </div>
            <style>
                .breathing-circle {
                    width: 200px;
                    height: 200px;
                    border: 3px solid #6366f1;
                    border-radius: 50%;
                    margin: 2rem auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 4s ease-in-out;
                }
                .breathing-circle.inhale {
                    transform: scale(1.5);
                }
                .breathing-text {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #6366f1;
                }
                .breathing-controls {
                    text-align: center;
                    margin: 2rem 0;
                }
                .breathing-instructions {
                    background: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-top: 2rem;
                }
            </style>
        `;
    }

    getMeditationContent() {
        return `
            <h2>Guided Meditation</h2>
            <div class="meditation-session">
                <div class="meditation-timer">
                    <div class="timer-display" id="timer-display">05:00</div>
                    <div class="timer-controls">
                        <button class="btn btn-outline" data-time="300">5 min</button>
                        <button class="btn btn-outline" data-time="600">10 min</button>
                        <button class="btn btn-outline" data-time="900">15 min</button>
                    </div>
                    <button class="btn btn-primary" id="start-meditation">Start Meditation</button>
                </div>
                <div class="meditation-guide">
                    <h3>Mindfulness Meditation Guide</h3>
                    <ol>
                        <li>Find a comfortable seated position</li>
                        <li>Close your eyes or soften your gaze</li>
                        <li>Focus on your natural breathing</li>
                        <li>When your mind wanders, gently return to your breath</li>
                        <li>Be kind and patient with yourself</li>
                    </ol>
                </div>
            </div>
        `;
    }

    getJournalContent() {
        return `
            <h2>Gratitude Journal</h2>
            <div class="journal-entry">
                <div class="journal-prompts">
                    <h3>Today I'm grateful for:</h3>
                    <textarea id="gratitude-1" placeholder="Something small that made you smile..."></textarea>
                    <textarea id="gratitude-2" placeholder="A person who means a lot to you..."></textarea>
                    <textarea id="gratitude-3" placeholder="An experience you cherish..."></textarea>
                </div>
                <div class="journal-reflection">
                    <h3>Reflection:</h3>
                    <textarea id="reflection" placeholder="How are you feeling right now? What's on your mind?"></textarea>
                </div>
                <button class="btn btn-primary" id="save-journal">Save Entry</button>
            </div>
            <style>
                .journal-entry textarea {
                    width: 100%;
                    min-height: 80px;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 0.5rem;
                    font-family: inherit;
                    resize: vertical;
                }
                .journal-entry textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                }
            </style>
        `;
    }

    getAffirmationsContent() {
        const affirmations = [
            "I am worthy of love and respect.",
            "I choose to focus on what I can control.",
            "I am growing stronger every day.",
            "I deserve happiness and peace.",
            "I am enough, just as I am.",
            "I have the power to create positive change.",
            "I am resilient and can overcome challenges.",
            "I choose to be kind to myself today.",
            "I am grateful for this moment.",
            "I trust in my ability to handle whatever comes my way."
        ];

        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

        return `
            <h2>Daily Affirmations</h2>
            <div class="affirmations-container">
                <div class="current-affirmation">
                    <div class="affirmation-text" id="affirmation-text">"${randomAffirmation}"</div>
                    <button class="btn btn-primary" id="new-affirmation">New Affirmation</button>
                </div>
                <div class="affirmations-practice">
                    <h3>How to Practice Affirmations:</h3>
                    <ul>
                        <li>Read the affirmation slowly and mindfully</li>
                        <li>Repeat it to yourself 3-5 times</li>
                        <li>Take a deep breath and feel the words</li>
                        <li>Believe in the truth of the statement</li>
                        <li>Carry this positive energy with you</li>
                    </ul>
                </div>
            </div>
            <style>
                .current-affirmation {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .affirmation-text {
                    font-size: 1.5rem;
                    font-style: italic;
                    color: #6366f1;
                    margin-bottom: 2rem;
                    padding: 2rem;
                    background: #f9fafb;
                    border-radius: 1rem;
                    border-left: 4px solid #6366f1;
                }
            </style>
        `;
    }

    getMusicContent() {
        return `
            <h2>Calming Music & Sounds</h2>
            <div class="music-player">
                <div class="music-options">
                    <div class="music-category">
                        <h3>Nature Sounds</h3>
                        <div class="sound-buttons">
                            <button class="btn btn-outline sound-btn" data-sound="rain">🌧️ Rain</button>
                            <button class="btn btn-outline sound-btn" data-sound="ocean">🌊 Ocean Waves</button>
                            <button class="btn btn-outline sound-btn" data-sound="forest">🌲 Forest</button>
                            <button class="btn btn-outline sound-btn" data-sound="birds">🐦 Birds</button>
                        </div>
                    </div>
                    <div class="music-category">
                        <h3>Ambient Music</h3>
                        <div class="sound-buttons">
                            <button class="btn btn-outline sound-btn" data-sound="meditation">🧘 Meditation</button>
                            <button class="btn btn-outline sound-btn" data-sound="piano">🎹 Soft Piano</button>
                            <button class="btn btn-outline sound-btn" data-sound="strings">🎻 Strings</button>
                            <button class="btn btn-outline sound-btn" data-sound="chimes">🎐 Wind Chimes</button>
                        </div>
                    </div>
                </div>
                <div class="player-controls">
                    <div class="now-playing" id="now-playing">Select a sound to begin</div>
                    <div class="volume-control">
                        <label>Volume: <input type="range" id="volume-slider" min="0" max="100" value="50"></label>
                    </div>
                    <div class="timer-controls">
                        <button class="btn btn-outline timer-btn" data-time="300">5 min</button>
                        <button class="btn btn-outline timer-btn" data-time="600">10 min</button>
                        <button class="btn btn-outline timer-btn" data-time="900">15 min</button>
                        <button class="btn btn-outline timer-btn" data-time="1800">30 min</button>
                        <button class="btn btn-outline timer-btn" data-time="3600">1 hour</button>
                        <input type="number" id="custom-timer-input" placeholder="Custom min" min="1">
                        <button class="btn btn-primary" id="set-custom-timer">Set Timer</button>
                    </div>
                    <div class="music-timer-display" id="music-timer-display"></div>
                </div>
            </div>
            <style>
                .music-category {
                    margin-bottom: 2rem;
                }
                .sound-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .sound-btn {
                    padding: 0.75rem;
                    font-size: 0.9rem;
                }
                .sound-btn.active {
                    background: #6366f1;
                    color: white;
                }
                .player-controls {
                    background: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-top: 2rem;
                    text-align: center;
                }
                .now-playing {
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #6366f1;
                }
                .volume-control input {
                    width: 200px;
                    margin-left: 0.5rem;
                }
            </style>
        `;
    }

    getExercisesContent() {
        return `
            <h2>Gentle Exercises</h2>
            <div class="exercises-container">
                <div class="exercise-categories">
                    <div class="exercise-category">
                        <h3>Stretching (5-10 minutes)</h3>
                        <ul class="exercise-list">
                            <li>Neck rolls - 5 each direction</li>
                            <li>Shoulder shrugs - 10 repetitions</li>
                            <li>Arm circles - 10 each direction</li>
                            <li>Gentle spinal twist - Hold 30 seconds each side</li>
                            <li>Forward fold - Hold 1 minute</li>
                        </ul>
                    </div>
                    <div class="exercise-category">
                        <h3>Breathing Exercises (5 minutes)</h3>
                        <ul class="exercise-list">
                            <li>Deep belly breathing - 10 breaths</li>
                            <li>4-7-8 breathing - 4 cycles</li>
                            <li>Box breathing - 5 minutes</li>
                        </ul>
                    </div>
                    <div class="exercise-category">
                        <h3>Light Movement (10-15 minutes)</h3>
                        <ul class="exercise-list">
                            <li>Gentle walking in place</li>
                            <li>Tai chi movements</li>
                            <li>Yoga sun salutations</li>
                            <li>Dancing to favorite music</li>
                        </ul>
                    </div>
                </div>
                <div class="exercise-timer">
                    <h3>Exercise Timer</h3>
                    <div class="timer-display" id="exercise-timer">00:00</div>
                    <div class="timer-buttons">
                        <button class="btn btn-primary" id="start-exercise-timer">Start</button>
                        <button class="btn btn-secondary" id="pause-exercise-timer">Pause</button>
                        <button class="btn btn-outline" id="reset-exercise-timer">Reset</button>
                    </div>
                </div>
            </div>
            <style>
                .exercise-categories {
                    display: grid;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                .exercise-category {
                    background: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                }
                .exercise-list {
                    list-style: none;
                    padding: 0;
                }
                .exercise-list li {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .exercise-list li:last-child {
                    border-bottom: none;
                }
                .exercise-timer {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    text-align: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .timer-display {
                    font-size: 3rem;
                    font-weight: bold;
                    color: #6366f1;
                    margin: 1rem 0;
                }
                .timer-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }
            </style>
        `;
    }

    initializeToolFunctionality(tool) {
        switch (tool) {
            case 'breathing':
                this.initBreathingExercise();
                break;
            case 'meditation':
                this.initMeditation();
                break;
            case 'journal':
                this.initJournal();
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
                this.initPsychology();
                break;
        }
    }

    initBreathingExercise() {
        const startBtn = document.getElementById('start-breathing');
        const stopBtn = document.getElementById('stop-breathing');
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        
        let breathingInterval;
        let isBreathing = false;

        startBtn?.addEventListener('click', () => {
            if (isBreathing) return;
            
            isBreathing = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            
            this.startBreathingCycle(circle, text);
        });

        stopBtn?.addEventListener('click', () => {
            isBreathing = false;
            clearTimeout(breathingInterval);
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            circle.classList.remove('inhale');
            text.textContent = 'Click Start';
        });
    }

    startBreathingCycle(circle, text) {
        const cycle = () => {
            // Inhale phase
            text.textContent = 'Breathe In';
            circle.classList.add('inhale');
            
            setTimeout(() => {
                // Hold phase
                text.textContent = 'Hold';
                
                setTimeout(() => {
                    // Exhale phase
                    text.textContent = 'Breathe Out';
                    circle.classList.remove('inhale');
                    
                    setTimeout(() => {
                        if (document.getElementById('start-breathing').style.display === 'none') {
                            cycle(); // Continue cycle
                        }
                    }, 4000); // 4 seconds exhale
                }, 2000); // 2 seconds hold
            }, 4000); // 4 seconds inhale
        };
        
        cycle();
    }

    initMeditation() {
        const timerButtons = document.querySelectorAll('[data-time]');
        const startBtn = document.getElementById('start-meditation');
        const display = document.getElementById('timer-display');
        
        let selectedTime = 300; // Default 5 minutes
        let meditationTimer;

        timerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                timerButtons.forEach(b => b.classList.remove('btn-primary'));
                btn.classList.add('btn-primary');
                selectedTime = parseInt(btn.dataset.time);
                this.updateTimerDisplay(display, selectedTime);
            });
        });

        startBtn?.addEventListener('click', () => {
            this.startMeditationTimer(selectedTime, display, startBtn);
        });
    }

    startMeditationTimer(duration, display, startBtn) {
        let timeLeft = duration;
        startBtn.textContent = 'Meditating...';
        startBtn.disabled = true;

        const timer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(display, timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timer);
                startBtn.textContent = 'Start Meditation';
                startBtn.disabled = false;
                this.showNotification('Meditation session complete! 🧘', 'success');
            }
        }, 1000);
    }

    updateTimerDisplay(display, seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    initJournal() {
        const saveBtn = document.getElementById('save-journal');
        
        saveBtn?.addEventListener('click', () => {
            const gratitude1 = document.getElementById('gratitude-1').value;
            const gratitude2 = document.getElementById('gratitude-2').value;
            const gratitude3 = document.getElementById('gratitude-3').value;
            const reflection = document.getElementById('reflection').value;

            if (!gratitude1 && !gratitude2 && !gratitude3 && !reflection) {
                this.showNotification('Please write something before saving!', 'warning');
                return;
            }

            const entry = {
                gratitude: [gratitude1, gratitude2, gratitude3].filter(g => g.trim()),
                reflection: reflection,
                date: new Date().toISOString()
            };

            // Save to localStorage
            const journalEntries = JSON.parse(localStorage.getItem('calmconnect_journal') || '[]');
            journalEntries.push(entry);
            localStorage.setItem('calmconnect_journal', JSON.stringify(journalEntries));

            this.showNotification('Journal entry saved! 📝', 'success');
            
            // Clear form
            document.getElementById('gratitude-1').value = '';
            document.getElementById('gratitude-2').value = '';
            document.getElementById('gratitude-3').value = '';
            document.getElementById('reflection').value = '';
        });
    }

    initAffirmations() {
        const newBtn = document.getElementById('new-affirmation');
        const textElement = document.getElementById('affirmation-text');
        
        const affirmations = [
            "I am worthy of love and respect.",
            "I choose to focus on what I can control.",
            "I am growing stronger every day.",
            "I deserve happiness and peace.",
            "I am enough, just as I am.",
            "I have the power to create positive change.",
            "I am resilient and can overcome challenges.",
            "I choose to be kind to myself today.",
            "I am grateful for this moment.",
            "I trust in my ability to handle whatever comes my way.",
            "I embrace my uniqueness and celebrate my strengths.",
            "I am capable of achieving my goals.",
            "I choose peace over worry.",
            "I am learning and growing from every experience.",
            "I radiate positivity and attract good things into my life."
        ];

        newBtn?.addEventListener('click', () => {
            const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
            textElement.textContent = `"${randomAffirmation}"`;
        });
    }

    initMusicPlayer() {
        const soundBtns = document.querySelectorAll('.sound-btn');
        const nowPlaying = document.getElementById('now-playing');
        const volumeSlider = document.getElementById('volume-slider');
        
        let currentAudio = null;
        let musicTimer = null;
        let timerDisplay = document.getElementById("music-timer-display");

        const stopMusicTimer = () => {
            if (musicTimer) {
                clearInterval(musicTimer);
                musicTimer = null;
                timerDisplay.textContent = "";
            }
        };

        const startMusicTimer = (duration) => {
            stopMusicTimer();
            let timeLeft = duration;
            timerDisplay.textContent = `Time left: ${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

            musicTimer = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = `Time left: ${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
                if (timeLeft <= 0) {
                    stopMusicTimer();
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                        currentAudio = null;
                        nowPlaying.textContent = "Select a sound to begin";
                        soundBtns.forEach(b => b.classList.remove("active"));
                    }
                    this.showNotification("Music timer finished!", "info");
                }
            }, 1000);
        };

        soundBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const sound = btn.dataset.sound;
                const audioSrc = `../assets/sounds/${sound}.mp3`; // Assuming sounds are in assets/sounds

                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                stopMusicTimer();
                soundBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                currentAudio = new Audio(audioSrc);
                currentAudio.loop = true;
                currentAudio.volume = volumeSlider.value / 100;
                currentAudio.play().catch(e => console.error("Error playing audio:", e));
                nowPlaying.textContent = `Now playing: ${btn.textContent}`;
            });
        });

        volumeSlider?.addEventListener("input", () => {
            if (currentAudio) {
                currentAudio.volume = volumeSlider.value / 100;
            }
        });

        const timerButtons = document.querySelectorAll(".timer-btn");
        timerButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const time = parseInt(btn.dataset.time);
                startMusicTimer(time);
            });
        });

        const customTimerInput = document.getElementById("custom-timer-input");
        const setCustomTimerBtn = document.getElementById("set-custom-timer");

        setCustomTimerBtn?.addEventListener("click", () => {
            const customMinutes = parseInt(customTimerInput.value);
            if (!isNaN(customMinutes) && customMinutes > 0) {
                startMusicTimer(customMinutes * 60);
                customTimerInput.value = "";
            } else {
                this.showNotification("Please enter a valid number of minutes for the custom timer.", "warning");
            }
        });
                // Stop current audio
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }
                
                // Remove active class from all buttons
                soundBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update now playing
                nowPlaying.textContent = `Playing: ${btn.textContent}`;
                
                // In a real app, you would load and play actual audio files
                // For demo purposes, we'll just show the interface
                this.showNotification(`Playing ${btn.textContent} 🎵`, 'info');
            });
        });

        volumeSlider?.addEventListener('input', (e) => {
            const volume = e.target.value;
            // In a real app, you would adjust the audio volume
            console.log(`Volume set to ${volume}%`);
        });
    }

    initExerciseTimer() {
        const startBtn = document.getElementById('start-exercise-timer');
        const pauseBtn = document.getElementById('pause-exercise-timer');
        const resetBtn = document.getElementById('reset-exercise-timer');
        const display = document.getElementById('exercise-timer');
        
        let exerciseTime = 0;
        let exerciseInterval;
        let isRunning = false;

        startBtn?.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.textContent = 'Running...';
                exerciseInterval = setInterval(() => {
                    exerciseTime++;
                    this.updateExerciseTimerDisplay(display, exerciseTime);
                }, 1000);
            }
        });

        pauseBtn?.addEventListener('click', () => {
            if (isRunning) {
                isRunning = false;
                clearInterval(exerciseInterval);
                startBtn.textContent = 'Resume';
            }
        });

        resetBtn?.addEventListener('click', () => {
            isRunning = false;
            clearInterval(exerciseInterval);
            exerciseTime = 0;
            this.updateExerciseTimerDisplay(display, exerciseTime);
            startBtn.textContent = 'Start';
        });
    }

    updateExerciseTimerDisplay(display, seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Emergency Support
    setupEmergencySupport() {
        const techniqueBtns = document.querySelectorAll('.technique-btn');
        
        techniqueBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const technique = btn.dataset.technique;
                this.startEmergencyTechnique(technique);
            });
        });
    }

    startEmergencyTechnique(technique) {
        let message = '';
        
        switch (technique) {
            case 'grounding':
                message = "Let's do the 5-4-3-2-1 grounding technique:\n\n" +
                         "Name 5 things you can SEE around you\n" +
                         "Name 4 things you can TOUCH\n" +
                         "Name 3 things you can HEAR\n" +
                         "Name 2 things you can SMELL\n" +
                         "Name 1 thing you can TASTE\n\n" +
                         "Take your time with each step.";
                break;
            case 'breathing':
                message = "Emergency breathing technique:\n\n" +
                         "1. Breathe in through your nose for 4 counts\n" +
                         "2. Hold your breath for 4 counts\n" +
                         "3. Breathe out through your mouth for 6 counts\n" +
                         "4. Repeat 5-10 times\n\n" +
                         "Focus only on your breathing.";
                break;
            case 'progressive':
                message = "Progressive muscle relaxation:\n\n" +
                         "1. Start with your toes - tense for 5 seconds, then relax\n" +
                         "2. Move to your calves - tense and relax\n" +
                         "3. Continue up through your body\n" +
                         "4. End with your face and head\n\n" +
                         "Notice the difference between tension and relaxation.";
                break;
        }
        
        alert(message);
    }

    // YouTube Integration
    loadYouTubeVideos() {
        const emergencyVideos = document.getElementById('emergency-videos');
        if (!emergencyVideos) return;

        // Simulated video recommendations (in a real app, you'd use YouTube API)
        const videos = [
            {
                title: "5-Minute Anxiety Relief",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            },
            {
                title: "Guided Breathing Exercise",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            },
            {
                title: "Calming Nature Sounds",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }
        ];

        const videosHTML = videos.map(video => `
            <div class="video-card">
                <img src="${video.thumbnail}" alt="${video.title}">
                <h4>${video.title}</h4>
                <a href="${video.url}" target="_blank" class="btn btn-outline">Watch Now</a>
            </div>
        `).join('');

        emergencyVideos.innerHTML = `
            <div class="video-grid">
                ${videosHTML}
            </div>
            <style>
                .video-grid {
                    display: grid;
                    gap: 1rem;
                }
                .video-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .video-card img {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 0.375rem;
                    margin-bottom: 0.5rem;
                }
                .video-card h4 {
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                    color: #374151;
                }
            </style>
        `;
    }

    // Privacy Controls
    setupPrivacyControls() {
        const clearDataBtn = document.getElementById('clear-all-data');
        const saveMoodToggle = document.getElementById('save-mood-data');
        const saveChatToggle = document.getElementById('save-chat-history');

        clearDataBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all your local data? This action cannot be undone.')) {
                localStorage.removeItem('calmconnect_mood_history');
                localStorage.removeItem('calmconnect_chat_history');
                localStorage.removeItem('calmconnect_journal');
                
                this.moodHistory = [];
                this.chatHistory = [];
                this.renderMoodChart();
                this.updateMoodStats();
                
                this.showNotification('All local data has been cleared.', 'success');
            }
        });

        // Load privacy settings
        const savedMoodSetting = localStorage.getItem('calmconnect_save_mood');
        const savedChatSetting = localStorage.getItem('calmconnect_save_chat');
        
        if (saveMoodToggle && savedMoodSetting !== null) {
            saveMoodToggle.checked = savedMoodSetting === 'true';
        }
        
        if (saveChatToggle && savedChatSetting !== null) {
            saveChatToggle.checked = savedChatSetting === 'true';
        }

        // Save privacy settings
        saveMoodToggle?.addEventListener('change', (e) => {
            localStorage.setItem('calmconnect_save_mood', e.target.checked);
        });

        saveChatToggle?.addEventListener('change', (e) => {
            localStorage.setItem('calmconnect_save_chat', e.target.checked);
        });
    }

    // Scroll Effects
    setupScrollEffects() {
        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.tool-card, .blog-card, .emergency-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });

        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Global functions for HTML onclick handlers
function scrollToSection(sectionId) {
    if (window.calmConnectApp) {
        window.calmConnectApp.scrollToSection(sectionId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calmConnectApp = new CalmConnectApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}



    // Institutional Features
    initInstitutional() {
        this.checkInstitutionalMode();
        this.initInstitutionalDashboard();
        this.initBrandingSettings();
        this.initCounselorSettings();
    }

    checkInstitutionalMode() {
        // Check for institutional mode via URL parameter or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const institutionParam = urlParams.get('institution');
        
        if (institutionParam) {
            localStorage.setItem('institutionalMode', 'true');
            localStorage.setItem('institutionName', institutionParam);
        }

        const isInstitutional = localStorage.getItem('institutionalMode') === 'true';
        
        if (isInstitutional) {
            this.enableInstitutionalMode();
        }
    }

    enableInstitutionalMode() {
        // Show institutional navigation link
        const institutionalLink = document.getElementById('institutional-link');
        if (institutionalLink) {
            institutionalLink.style.display = 'block';
        }

        // Show institutional section on landing page
        const institutionalSection = document.getElementById('institutional-section');
        if (institutionalSection) {
            institutionalSection.style.display = 'block';
        }

        // Load custom branding
        this.loadCustomBranding();
    }

    loadCustomBranding() {
        const institutionName = localStorage.getItem('institutionName') || 'Demo University';
        const customLogo = localStorage.getItem('customLogo');
        const primaryColor = localStorage.getItem('primaryColor') || '#6366f1';
        const secondaryColor = localStorage.getItem('secondaryColor') || '#8b5cf6';

        // Update institution name
        const institutionNameElement = document.getElementById('institution-name');
        if (institutionNameElement) {
            institutionNameElement.textContent = institutionName;
        }

        // Update app title with institution name
        const appTitle = document.getElementById('app-title');
        if (appTitle) {
            appTitle.textContent = `CalmConnect - ${institutionName}`;
        }

        // Load custom logo
        if (customLogo) {
            const logoElement = document.getElementById('institution-logo');
            if (logoElement) {
                logoElement.src = customLogo;
                logoElement.style.display = 'inline-block';
            }
        }

        // Apply custom colors
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    }

    initInstitutionalDashboard() {
        // Generate mock data for institutional dashboard
        this.generateMockInstitutionalData();
        this.initInstitutionalCharts();
    }

    generateMockInstitutionalData() {
        // Simulate aggregated data from multiple users
        const mockData = {
            totalUsers: Math.floor(Math.random() * 2000) + 500,
            moodEntries: Math.floor(Math.random() * 10000) + 5000,
            chatSessions: Math.floor(Math.random() * 5000) + 2000,
            escalations: Math.floor(Math.random() * 50) + 10
        };

        // Update dashboard stats
        const totalUsersElement = document.getElementById('total-users');
        const moodEntriesElement = document.getElementById('mood-entries');
        const chatSessionsElement = document.getElementById('chat-sessions');
        const escalationsElement = document.getElementById('escalations');

        if (totalUsersElement) totalUsersElement.textContent = mockData.totalUsers.toLocaleString();
        if (moodEntriesElement) moodEntriesElement.textContent = mockData.moodEntries.toLocaleString();
        if (chatSessionsElement) chatSessionsElement.textContent = mockData.chatSessions.toLocaleString();
        if (escalationsElement) escalationsElement.textContent = mockData.escalations.toString();
    }

    initInstitutionalCharts() {
        // Institutional mood trends chart
        const institutionalMoodChart = document.getElementById('institutional-mood-chart');
        if (institutionalMoodChart) {
            const ctx = institutionalMoodChart.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Average Mood Score',
                        data: [3.2, 3.5, 3.1, 3.8, 3.6, 3.9],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
        }

        // Usage analytics chart
        const usageChart = document.getElementById('usage-chart');
        if (usageChart) {
            const ctx = usageChart.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Mood Check', 'Chat', 'Self-Care', 'Emergency', 'Blog'],
                    datasets: [{
                        data: [35, 25, 20, 10, 10],
                        backgroundColor: [
                            '#6366f1',
                            '#8b5cf6',
                            '#06d6a0',
                            '#f72585',
                            '#ffd60a'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    }

    initBrandingSettings() {
        const brandingModal = document.getElementById('branding-modal');
        const saveBrandingBtn = document.getElementById('save-branding');
        const logoUpload = document.getElementById('logo-upload');

        if (saveBrandingBtn) {
            saveBrandingBtn.addEventListener('click', () => {
                const institutionName = document.getElementById('institution-name-input').value;
                const primaryColor = document.getElementById('primary-color').value;
                const secondaryColor = document.getElementById('secondary-color').value;

                if (institutionName) {
                    localStorage.setItem('institutionName', institutionName);
                }
                localStorage.setItem('primaryColor', primaryColor);
                localStorage.setItem('secondaryColor', secondaryColor);

                this.loadCustomBranding();
                this.closeModal(brandingModal);
                this.showNotification('Branding settings saved successfully!');
            });
        }

        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        localStorage.setItem('customLogo', e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    initCounselorSettings() {
        const saveCounselorBtn = document.getElementById('save-counselor-settings');
        
        if (saveCounselorBtn) {
            saveCounselorBtn.addEventListener('click', () => {
                const counselorEmail = document.getElementById('counselor-email').value;
                const backupEmail = document.getElementById('backup-email').value;
                const escalationThreshold = document.getElementById('escalation-threshold').value;

                localStorage.setItem('counselorEmail', counselorEmail);
                localStorage.setItem('backupEmail', backupEmail);
                localStorage.setItem('escalationThreshold', escalationThreshold);

                this.closeModal(document.getElementById('counselor-modal'));
                this.showNotification('Counselor settings saved successfully!');
            });
        }
    }

    // Escalation system
    checkForEscalation(message) {
        const crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'hurt myself', 'self-harm',
            'want to die', 'no point', 'hopeless', 'can\'t go on'
        ];

        const messageText = message.toLowerCase();
        const hasCrisisKeyword = crisisKeywords.some(keyword => messageText.includes(keyword));

        if (hasCrisisKeyword) {
            this.triggerEscalation('immediate', message);
        }
    }

    triggerEscalation(level, context) {
        const escalationNotice = document.getElementById('escalation-notice');
        if (escalationNotice) {
            escalationNotice.style.display = 'block';
        }

        // Store escalation data
        const escalation = {
            id: Date.now(),
            level: level,
            context: context,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const escalations = JSON.parse(localStorage.getItem('escalations') || '[]');
        escalations.push(escalation);
        localStorage.setItem('escalations', JSON.stringify(escalations));

        // In a real system, this would send an alert to counselors
        console.log('Escalation triggered:', escalation);
    }

    // Landing page initialization
    initLanding() {
        this.checkInstitutionalMode();
    }

    // Blog page initialization
    initBlog() {
        // Blog functionality can be added here
        console.log('Blog page initialized');
    }

    // Privacy page initialization
    initPrivacy() {
        this.initPrivacyControls();
    }

    initPrivacyControls() {
        const clearDataBtn = document.getElementById('clear-all-data');
        const saveMoodToggle = document.getElementById('save-mood-data');
        const saveChatToggle = document.getElementById('save-chat-data');

        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
                    localStorage.clear();
                    this.showNotification('All local data has been cleared.');
                    location.reload();
                }
            });
        }

        if (saveMoodToggle) {
            saveMoodToggle.checked = localStorage.getItem('saveMoodData') !== 'false';
            saveMoodToggle.addEventListener('change', (e) => {
                localStorage.setItem('saveMoodData', e.target.checked);
            });
        }

        if (saveChatToggle) {
            saveChatToggle.checked = localStorage.getItem('saveChatData') === 'true';
            saveChatToggle.addEventListener('change', (e) => {
                localStorage.setItem('saveChatData', e.target.checked);
            });
        }
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for modal management
function openBrandingSettings() {
    const modal = document.getElementById('branding-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openAnalytics() {
    // Placeholder for advanced analytics
    alert('Advanced analytics feature would open detailed reports here.');
}

function openCounselorSettings() {
    const modal = document.getElementById('counselor-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function exportData() {
    // Simulate data export
    const data = {
        moodEntries: JSON.parse(localStorage.getItem('moodEntries') || '[]'),
        escalations: JSON.parse(localStorage.getItem('escalations') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calmconnect-institutional-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking close button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Handle escalation buttons
    const escalateBtn = document.getElementById('escalate-btn');
    const dismissEscalationBtn = document.getElementById('dismiss-escalation');

    if (escalateBtn) {
        escalateBtn.addEventListener('click', () => {
            alert('In a real system, this would connect you with a counselor. For demo purposes, this shows the escalation workflow.');
            document.getElementById('escalation-notice').style.display = 'none';
        });
    }

    if (dismissEscalationBtn) {
        dismissEscalationBtn.addEventListener('click', () => {
            document.getElementById('escalation-notice').style.display = 'none';
        });
    }
})// Initialize app when DOM is loaded
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
            window.calmConnectApp.initChatbot();
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
});    // Enhanced Self-Care Tools

    getVisualizationContent() {
        return `
            <h2>Guided Imagery & Visualization</h2>
            <div class="visualization-container">
                <div class="visualization-selector">
                    <h3>Choose Your Journey:</h3>
                    <div class="journey-options">
                        <button class="btn btn-outline journey-btn" data-journey="beach">🏖️ Peaceful Beach</button>
                        <button class="btn btn-outline journey-btn" data-journey="forest">🌲 Quiet Forest</button>
                        <button class="btn btn-outline journey-btn" data-journey="mountain">🏔️ Mountain Peak</button>
                        <button class="btn btn-outline journey-btn" data-journey="garden">🌸 Secret Garden</button>
                        <button class="btn btn-outline journey-btn" data-journey="cozy">🏠 Cozy Room</button>
                    </div>
                </div>
                <div class="visualization-player" id="visualization-player" style="display: none;">
                    <div class="journey-content" id="journey-content"></div>
                    <div class="player-controls">
                        <button class="btn btn-primary" id="start-journey">Start Journey</button>
                        <button class="btn btn-secondary" id="pause-journey" style="display: none;">Pause</button>
                        <button class="btn btn-outline" id="reset-journey">Reset</button>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" id="journey-progress"></div>
                    </div>
                    <div class="journey-timer" id="journey-timer">0:00 / 0:00</div>
                </div>
            </div>
            <style>
                .journey-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                .journey-btn {
                    padding: 1rem;
                    text-align: center;
                    border-radius: 0.75rem;
                }
                .journey-btn.active {
                    background: #6366f1;
                    color: white;
                }
                .visualization-player {
                    background: #f9fafb;
                    padding: 2rem;
                    border-radius: 1rem;
                    margin-top: 2rem;
                }
                .journey-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 0.75rem;
                    margin-bottom: 2rem;
                    min-height: 200px;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }
                .progress-bar {
                    width: 100%;
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    margin: 1rem 0;
                    overflow: hidden;
                }
                .progress {
                    height: 100%;
                    background: #6366f1;
                    width: 0%;
                    transition: width 0.3s ease;
                }
                .journey-timer {
                    text-align: center;
                    color: #6b7280;
                    font-size: 0.9rem;
                }
            </style>
        `;
    }

    getPsychologyContent() {
        return `
            <h2>Positive Psychology Exercises</h2>
            <div class="psychology-container">
                <div class="exercise-selector">
                    <h3>Choose an Exercise:</h3>
                    <div class="exercise-options">
                        <button class="btn btn-outline exercise-btn" data-exercise="three-good">✨ Three Good Things</button>
                        <button class="btn btn-outline exercise-btn" data-exercise="best-self">🌟 Best Possible Self</button>
                        <button class="btn btn-outline exercise-btn" data-exercise="gratitude-letter">💌 Gratitude Letter</button>
                        <button class="btn btn-outline exercise-btn" data-exercise="strengths">💪 Character Strengths</button>
                        <button class="btn btn-outline exercise-btn" data-exercise="acts-kindness">❤️ Acts of Kindness</button>
                    </div>
                </div>
                <div class="exercise-content" id="psychology-exercise-content">
                    <div class="exercise-intro">
                        <h3>Welcome to Positive Psychology Exercises</h3>
                        <p>These evidence-based exercises are designed to enhance your well-being, build resilience, and cultivate positive emotions. Select an exercise above to begin your journey toward greater happiness and life satisfaction.</p>
                        <div class="benefits">
                            <h4>Benefits of Positive Psychology:</h4>
                            <ul>
                                <li>Increased life satisfaction and happiness</li>
                                <li>Better emotional regulation</li>
                                <li>Enhanced resilience to stress</li>
                                <li>Improved relationships and social connections</li>
                                <li>Greater sense of meaning and purpose</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .exercise-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                .exercise-btn {
                    padding: 1rem;
                    text-align: center;
                    border-radius: 0.75rem;
                }
                .exercise-btn.active {
                    background: #6366f1;
                    color: white;
                }
                .exercise-content {
                    background: #f9fafb;
                    padding: 2rem;
                    border-radius: 1rem;
                    margin-top: 2rem;
                }
                .exercise-intro {
                    text-align: center;
                }
                .benefits {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-top: 2rem;
                    text-align: left;
                }
                .exercise-form {
                    background: white;
                    padding: 2rem;
                    border-radius: 0.75rem;
                    margin-top: 1rem;
                }
                .exercise-form textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-family: inherit;
                    resize: vertical;
                }
                .exercise-form label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
            </style>
        `;
    }

    getEnhancedMusicContent() {
        return `
            <h2>Soundscapes & Music with Timers</h2>
            <div class="enhanced-music-player">
                <div class="timer-section">
                    <h3>Set Timer (Optional)</h3>
                    <div class="timer-controls">
                        <button class="btn btn-outline timer-btn" data-minutes="5">5 min</button>
                        <button class="btn btn-outline timer-btn" data-minutes="10">10 min</button>
                        <button class="btn btn-outline timer-btn" data-minutes="15">15 min</button>
                        <button class="btn btn-outline timer-btn" data-minutes="30">30 min</button>
                        <button class="btn btn-outline timer-btn" data-minutes="60">1 hour</button>
                        <input type="number" id="custom-timer" placeholder="Custom (min)" min="1" max="180">
                    </div>
                    <div class="timer-display" id="timer-display" style="display: none;">
                        <div class="time-remaining" id="time-remaining">00:00</div>
                        <div class="timer-progress">
                            <div class="timer-bar" id="timer-bar"></div>
                        </div>
                    </div>
                </div>
                
                <div class="music-options">
                    <div class="music-category">
                        <h3>Nature Sounds</h3>
                        <div class="sound-buttons">
                            <button class="btn btn-outline sound-btn" data-sound="rain">🌧️ Rain</button>
                            <button class="btn btn-outline sound-btn" data-sound="ocean">🌊 Ocean Waves</button>
                            <button class="btn btn-outline sound-btn" data-sound="forest">🌲 Forest</button>
                            <button class="btn btn-outline sound-btn" data-sound="birds">🐦 Birds</button>
                            <button class="btn btn-outline sound-btn" data-sound="thunder">⛈️ Thunder</button>
                            <button class="btn btn-outline sound-btn" data-sound="stream">🏞️ Stream</button>
                        </div>
                    </div>
                    <div class="music-category">
                        <h3>Ambient Music</h3>
                        <div class="sound-buttons">
                            <button class="btn btn-outline sound-btn" data-sound="meditation">🧘 Meditation</button>
                            <button class="btn btn-outline sound-btn" data-sound="piano">🎹 Soft Piano</button>
                            <button class="btn btn-outline sound-btn" data-sound="strings">🎻 Strings</button>
                            <button class="btn btn-outline sound-btn" data-sound="chimes">🎐 Wind Chimes</button>
                            <button class="btn btn-outline sound-btn" data-sound="tibetan">🔔 Tibetan Bowls</button>
                            <button class="btn btn-outline sound-btn" data-sound="flute">🪈 Flute</button>
                        </div>
                    </div>
                </div>
                
                <div class="player-controls">
                    <div class="now-playing" id="enhanced-now-playing">Select a sound to begin</div>
                    <div class="control-buttons">
                        <button class="btn btn-primary" id="play-pause-btn">▶️ Play</button>
                        <button class="btn btn-secondary" id="stop-btn">⏹️ Stop</button>
                    </div>
                    <div class="volume-control">
                        <label>Volume: <input type="range" id="enhanced-volume-slider" min="0" max="100" value="50"></label>
                    </div>
                </div>
            </div>
            <style>
                .timer-section {
                    background: #f0f9ff;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                    border: 2px solid #0ea5e9;
                }
                .timer-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin: 1rem 0;
                    align-items: center;
                }
                .timer-btn {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }
                .timer-btn.active {
                    background: #0ea5e9;
                    color: white;
                }
                #custom-timer {
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    width: 120px;
                }
                .timer-display {
                    text-align: center;
                    margin-top: 1rem;
                }
                .time-remaining {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #0ea5e9;
                    margin-bottom: 1rem;
                }
                .timer-progress {
                    width: 100%;
                    height: 8px;
                    background: #e0f2fe;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .timer-bar {
                    height: 100%;
                    background: #0ea5e9;
                    width: 100%;
                    transition: width 1s linear;
                }
                .music-category {
                    margin-bottom: 2rem;
                }
                .sound-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .sound-btn {
                    padding: 0.75rem;
                    font-size: 0.9rem;
                }
                .sound-btn.active {
                    background: #6366f1;
                    color: white;
                }
                .player-controls {
                    background: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-top: 2rem;
                    text-align: center;
                }
                .control-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin: 1rem 0;
                }
                .volume-control {
                    margin-top: 1rem;
                }
                .volume-control input {
                    width: 200px;
                    margin-left: 0.5rem;
                }
            </style>
        `;
    }


    // Initialize Self-Care Tools
    initSelfCare() {
        this.setupSelfCareTools();
        this.setupToolModal();
    }

    setupSelfCareTools() {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const button = card.querySelector('button');
            button?.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.openSelfCareTool(tool);
            });
        });
    }

    setupToolModal() {
        const modal = document.getElementById('tool-modal');
        const closeBtn = modal?.querySelector('.close');
        
        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    openSelfCareTool(tool) {
        const modal = document.getElementById('tool-modal');
        const content = document.getElementById('tool-content');
        
        if (!modal || !content) return;

        let toolContent = '';
        
        switch (tool) {
            case 'breathing':
                toolContent = this.getBreathingContent();
                break;
            case 'meditation':
                toolContent = this.getMeditationContent();
                break;
            case 'journal':
                toolContent = this.getJournalContent();
                break;
            case 'affirmations':
                toolContent = this.getAffirmationsContent();
                break;
            case 'music':
                toolContent = this.getEnhancedMusicContent();
                break;
            case 'exercises':
                toolContent = this.getExercisesContent();
                break;
            case 'visualization':
                toolContent = this.getVisualizationContent();
                break;
            case 'psychology':
                toolContent = this.getPsychologyContent();
                break;
        }

        content.innerHTML = toolContent;
        modal.style.display = 'block';

        // Initialize tool-specific functionality
        setTimeout(() => {
            this.initToolSpecificFeatures(tool);
        }, 100);
    }

    initToolSpecificFeatures(tool) {
        switch (tool) {
            case 'breathing':
                this.initBreathingExercise();
                break;
            case 'meditation':
                this.initMeditation();
                break;
            case 'journal':
                this.initJournal();
                break;
            case 'affirmations':
                this.initAffirmations();
                break;
            case 'music':
                this.initEnhancedMusicPlayer();
                break;
            case 'exercises':
                this.initExercises();
                break;
            case 'visualization':
                this.initVisualization();
                break;
            case 'psychology':
                this.initPsychologyExercises();
                break;
        }
    }

    // Enhanced Music Player with Timers
    initEnhancedMusicPlayer() {
        const soundBtns = document.querySelectorAll('.sound-btn');
        const timerBtns = document.querySelectorAll('.timer-btn');
        const customTimer = document.getElementById('custom-timer');
        const nowPlaying = document.getElementById('enhanced-now-playing');
        const volumeSlider = document.getElementById('enhanced-volume-slider');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        const timerDisplay = document.getElementById('timer-display');
        const timeRemaining = document.getElementById('time-remaining');
        const timerBar = document.getElementById('timer-bar');
        
        let currentAudio = null;
        let currentTimer = null;
        let timerDuration = 0;
        let timeLeft = 0;
        let isPlaying = false;

        // Timer button handlers
        timerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                timerDuration = parseInt(btn.dataset.minutes) * 60;
                customTimer.value = '';
                this.updateTimerDisplay();
            });
        });

        // Custom timer handler
        customTimer.addEventListener('change', () => {
            const minutes = parseInt(customTimer.value);
            if (minutes > 0) {
                timerBtns.forEach(b => b.classList.remove('active'));
                timerDuration = minutes * 60;
                this.updateTimerDisplay();
            }
        });

        // Sound button handlers
        soundBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sound = btn.dataset.sound;
                this.playSound(sound, btn, nowPlaying);
            });
        });

        // Play/Pause button
        playPauseBtn.addEventListener('click', () => {
            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                    playPauseBtn.textContent = '▶️ Play';
                    this.pauseTimer();
                } else {
                    currentAudio.play();
                    playPauseBtn.textContent = '⏸️ Pause';
                    this.resumeTimer();
                }
                isPlaying = !isPlaying;
            }
        });

        // Stop button
        stopBtn.addEventListener('click', () => {
            this.stopSound();
        });

        // Volume control
        volumeSlider.addEventListener('input', () => {
            if (currentAudio) {
                currentAudio.volume = volumeSlider.value / 100;
            }
        });

        this.updateTimerDisplay = () => {
            if (timerDuration > 0) {
                timerDisplay.style.display = 'block';
                timeLeft = timerDuration;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timerBar.style.width = '100%';
            } else {
                timerDisplay.style.display = 'none';
            }
        };

        this.startTimer = () => {
            if (timerDuration > 0 && !currentTimer) {
                timeLeft = timerDuration;
                currentTimer = setInterval(() => {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    const progress = (timeLeft / timerDuration) * 100;
                    timerBar.style.width = `${progress}%`;

                    if (timeLeft <= 0) {
                        this.stopSound();
                        this.showNotification('Timer finished! 🔔', 'success');
                    }
                }, 1000);
            }
        };

        this.pauseTimer = () => {
            if (currentTimer) {
                clearInterval(currentTimer);
                currentTimer = null;
            }
        };

        this.resumeTimer = () => {
            if (timeLeft > 0) {
                this.startTimer();
            }
        };

        this.playSound = (sound, btn, display) => {
            // Stop current audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            // Clear active states
            soundBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Simulate audio playback (in real app, you'd load actual audio files)
            display.textContent = `Playing: ${btn.textContent}`;
            playPauseBtn.textContent = '⏸️ Pause';
            isPlaying = true;

            // Start timer if set
            this.startTimer();

            // Simulate audio object
            currentAudio = {
                pause: () => { isPlaying = false; },
                play: () => { isPlaying = true; },
                volume: volumeSlider.value / 100
            };
        };

        this.stopSound = () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            
            if (currentTimer) {
                clearInterval(currentTimer);
                currentTimer = null;
            }

            soundBtns.forEach(b => b.classList.remove('active'));
            nowPlaying.textContent = 'Select a sound to begin';
            playPauseBtn.textContent = '▶️ Play';
            isPlaying = false;
            
            // Reset timer display
            if (timerDuration > 0) {
                this.updateTimerDisplay();
            }
        };
    }

    // Visualization/Guided Imagery
    initVisualization() {
        const journeyBtns = document.querySelectorAll('.journey-btn');
        const player = document.getElementById('visualization-player');
        const content = document.getElementById('journey-content');
        const startBtn = document.getElementById('start-journey');
        const pauseBtn = document.getElementById('pause-journey');
        const resetBtn = document.getElementById('reset-journey');
        const progress = document.getElementById('journey-progress');
        const timer = document.getElementById('journey-timer');

        let currentJourney = null;
        let journeyTimer = null;
        let currentStep = 0;
        let isPaused = false;

        const journeys = {
            beach: {
                title: "Peaceful Beach",
                duration: 300, // 5 minutes
                steps: [
                    "Close your eyes and take three deep breaths...",
                    "Imagine yourself walking on a beautiful, secluded beach...",
                    "Feel the warm sand beneath your feet...",
                    "Listen to the gentle sound of waves lapping the shore...",
                    "Feel the warm sun on your skin and a gentle breeze...",
                    "Notice the vast blue ocean stretching to the horizon...",
                    "Take a moment to appreciate this peaceful place...",
                    "When you're ready, slowly open your eyes..."
                ]
            },
            forest: {
                title: "Quiet Forest",
                duration: 300,
                steps: [
                    "Close your eyes and breathe deeply...",
                    "Imagine yourself in a peaceful forest clearing...",
                    "Notice the tall trees surrounding you...",
                    "Listen to the gentle rustling of leaves...",
                    "Feel the soft earth beneath your feet...",
                    "Breathe in the fresh, clean forest air...",
                    "Notice the dappled sunlight filtering through the trees...",
                    "Take a moment to feel completely at peace...",
                    "When ready, slowly return to the present moment..."
                ]
            },
            mountain: {
                title: "Mountain Peak",
                duration: 300,
                steps: [
                    "Close your eyes and center yourself...",
                    "Imagine standing on a peaceful mountain peak...",
                    "Feel the solid ground beneath you...",
                    "Look out at the vast landscape below...",
                    "Breathe in the crisp, clean mountain air...",
                    "Feel a sense of accomplishment and strength...",
                    "Notice the clarity and perspective from this height...",
                    "Carry this feeling of strength with you...",
                    "Slowly return to your current surroundings..."
                ]
            },
            garden: {
                title: "Secret Garden",
                duration: 300,
                steps: [
                    "Close your eyes and relax completely...",
                    "Imagine discovering a hidden, beautiful garden...",
                    "Notice the colorful flowers blooming around you...",
                    "Smell the sweet fragrance in the air...",
                    "Listen to the gentle buzzing of bees...",
                    "Feel the soft grass beneath you...",
                    "Find a comfortable spot to sit and rest...",
                    "Feel completely safe and peaceful here...",
                    "When ready, slowly open your eyes..."
                ]
            },
            cozy: {
                title: "Cozy Room",
                duration: 300,
                steps: [
                    "Close your eyes and settle in...",
                    "Imagine yourself in the coziest room you can think of...",
                    "Notice the soft lighting and comfortable furniture...",
                    "Feel the warmth and safety of this space...",
                    "Perhaps there's a fireplace crackling softly...",
                    "You have everything you need here...",
                    "Feel completely relaxed and at home...",
                    "Take a moment to appreciate this comfort...",
                    "Carry this feeling of safety with you..."
                ]
            }
        };

        journeyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const journey = btn.dataset.journey;
                this.selectJourney(journey);
            });
        });

        startBtn.addEventListener('click', () => {
            this.startJourney();
        });

        pauseBtn.addEventListener('click', () => {
            this.pauseJourney();
        });

        resetBtn.addEventListener('click', () => {
            this.resetJourney();
        });

        this.selectJourney = (journeyKey) => {
            journeyBtns.forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-journey="${journeyKey}"]`).classList.add('active');
            
            currentJourney = journeys[journeyKey];
            player.style.display = 'block';
            content.innerHTML = `
                <h3>${currentJourney.title}</h3>
                <p>This guided imagery session will take approximately ${Math.floor(currentJourney.duration / 60)} minutes. Find a comfortable position and prepare to relax.</p>
                <p><strong>Instructions:</strong> Close your eyes, breathe deeply, and follow along with the guidance. Let your imagination create vivid, peaceful scenes.</p>
            `;
            
            this.resetJourney();
        };

        this.startJourney = () => {
            if (!currentJourney) return;

            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            
            const stepDuration = currentJourney.duration / currentJourney.steps.length;
            let timeElapsed = currentStep * stepDuration;

            journeyTimer = setInterval(() => {
                if (!isPaused) {
                    timeElapsed++;
                    
                    // Update progress
                    const progressPercent = (timeElapsed / currentJourney.duration) * 100;
                    progress.style.width = `${Math.min(progressPercent, 100)}%`;
                    
                    // Update timer display
                    const minutes = Math.floor(timeElapsed / 60);
                    const seconds = timeElapsed % 60;
                    const totalMinutes = Math.floor(currentJourney.duration / 60);
                    const totalSeconds = currentJourney.duration % 60;
                    timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
                    
                    // Check if it's time for next step
                    const newStep = Math.floor(timeElapsed / stepDuration);
                    if (newStep !== currentStep && newStep < currentJourney.steps.length) {
                        currentStep = newStep;
                        content.innerHTML = `
                            <h3>${currentJourney.title}</h3>
                            <div class="journey-step">
                                <p>${currentJourney.steps[currentStep]}</p>
                            </div>
                            <div class="step-indicator">Step ${currentStep + 1} of ${currentJourney.steps.length}</div>
                        `;
                    }
                    
                    // Check if journey is complete
                    if (timeElapsed >= currentJourney.duration) {
                        this.completeJourney();
                    }
                }
            }, 1000);
        };

        this.pauseJourney = () => {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        };

        this.resetJourney = () => {
            if (journeyTimer) {
                clearInterval(journeyTimer);
                journeyTimer = null;
            }
            
            currentStep = 0;
            isPaused = false;
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            progress.style.width = '0%';
            timer.textContent = '0:00 / 0:00';
            
            if (currentJourney) {
                content.innerHTML = `
                    <h3>${currentJourney.title}</h3>
                    <p>This guided imagery session will take approximately ${Math.floor(currentJourney.duration / 60)} minutes. Find a comfortable position and prepare to relax.</p>
                    <p><strong>Instructions:</strong> Close your eyes, breathe deeply, and follow along with the guidance. Let your imagination create vivid, peaceful scenes.</p>
                `;
            }
        };

        this.completeJourney = () => {
            if (journeyTimer) {
                clearInterval(journeyTimer);
                journeyTimer = null;
            }
            
            content.innerHTML = `
                <h3>Journey Complete</h3>
                <p>🌟 Congratulations! You've completed your ${currentJourney.title} visualization journey.</p>
                <p>Take a moment to notice how you feel. Carry this sense of peace and calm with you throughout your day.</p>
                <div class="completion-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal').style.display='none'">Close</button>
                    <button class="btn btn-outline" id="restart-journey">Start Again</button>
                </div>
            `;
            
            document.getElementById('restart-journey').addEventListener('click', () => {
                this.resetJourney();
            });
            
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            progress.style.width = '100%';
            
            this.showNotification('Visualization journey completed! 🧘‍♀️', 'success');
        };
    }

    // Positive Psychology Exercises
    initPsychologyExercises() {
        const exerciseBtns = document.querySelectorAll('.exercise-btn');
        const exerciseContent = document.getElementById('psychology-exercise-content');

        const exercises = {
            'three-good': {
                title: 'Three Good Things',
                description: 'Reflect on three positive things that happened today and why they were meaningful.',
                form: `
                    <div class="exercise-form">
                        <h4>What are three good things that happened today?</h4>
                        <div class="form-group">
                            <label>Good Thing #1:</label>
                            <textarea id="good-thing-1" placeholder="Describe something positive that happened..."></textarea>
                            <label>Why was this meaningful to you?</label>
                            <textarea id="meaning-1" placeholder="Reflect on why this mattered..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Good Thing #2:</label>
                            <textarea id="good-thing-2" placeholder="Describe something positive that happened..."></textarea>
                            <label>Why was this meaningful to you?</label>
                            <textarea id="meaning-2" placeholder="Reflect on why this mattered..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Good Thing #3:</label>
                            <textarea id="good-thing-3" placeholder="Describe something positive that happened..."></textarea>
                            <label>Why was this meaningful to you?</label>
                            <textarea id="meaning-3" placeholder="Reflect on why this mattered..."></textarea>
                        </div>
                        <button class="btn btn-primary" id="save-three-good">Save Reflection</button>
                    </div>
                `
            },
            'best-self': {
                title: 'Best Possible Self',
                description: 'Imagine your best possible future self and write about it in detail.',
                form: `
                    <div class="exercise-form">
                        <h4>Imagine Your Best Possible Self</h4>
                        <p>Think about your life in the future. Imagine that everything has gone as well as it possibly could. You have worked hard and succeeded at accomplishing all of your life goals. Think of this as the realization of all of your life dreams.</p>
                        <div class="form-group">
                            <label>Describe your best possible self in detail:</label>
                            <textarea id="best-self-description" placeholder="Write about your ideal future self - your relationships, career, personal growth, achievements..." rows="8"></textarea>
                        </div>
                        <div class="form-group">
                            <label>What steps can you take today to move toward this vision?</label>
                            <textarea id="action-steps" placeholder="List specific actions you can take..." rows="4"></textarea>
                        </div>
                        <button class="btn btn-primary" id="save-best-self">Save Vision</button>
                    </div>
                `
            },
            'gratitude-letter': {
                title: 'Gratitude Letter',
                description: 'Write a letter to someone who has positively impacted your life.',
                form: `
                    <div class="exercise-form">
                        <h4>Write a Gratitude Letter</h4>
                        <p>Think of someone who has done something important and wonderful for you, but whom you have never properly thanked. Write them a letter expressing your gratitude.</p>
                        <div class="form-group">
                            <label>Who are you writing to?</label>
                            <input type="text" id="gratitude-recipient" placeholder="Name of the person...">
                        </div>
                        <div class="form-group">
                            <label>Your gratitude letter:</label>
                            <textarea id="gratitude-letter-content" placeholder="Dear [Name],

I wanted to take a moment to express my heartfelt gratitude for...

Write about what they did, how it affected you, and what it means to you..." rows="10"></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="will-send"> I plan to send or share this letter
                            </label>
                        </div>
                        <button class="btn btn-primary" id="save-gratitude-letter">Save Letter</button>
                    </div>
                `
            },
            'strengths': {
                title: 'Character Strengths',
                description: 'Identify and reflect on your top character strengths.',
                form: `
                    <div class="exercise-form">
                        <h4>Identify Your Character Strengths</h4>
                        <p>Select your top 5 character strengths from the list below, then reflect on how you can use them more in your daily life.</p>
                        <div class="strengths-grid">
                            <label><input type="checkbox" name="strength" value="Creativity"> Creativity</label>
                            <label><input type="checkbox" name="strength" value="Curiosity"> Curiosity</label>
                            <label><input type="checkbox" name="strength" value="Judgment"> Judgment</label>
                            <label><input type="checkbox" name="strength" value="Love of Learning"> Love of Learning</label>
                            <label><input type="checkbox" name="strength" value="Perspective"> Perspective</label>
                            <label><input type="checkbox" name="strength" value="Bravery"> Bravery</label>
                            <label><input type="checkbox" name="strength" value="Perseverance"> Perseverance</label>
                            <label><input type="checkbox" name="strength" value="Honesty"> Honesty</label>
                            <label><input type="checkbox" name="strength" value="Zest"> Zest</label>
                            <label><input type="checkbox" name="strength" value="Love"> Love</label>
                            <label><input type="checkbox" name="strength" value="Kindness"> Kindness</label>
                            <label><input type="checkbox" name="strength" value="Social Intelligence"> Social Intelligence</label>
                            <label><input type="checkbox" name="strength" value="Teamwork"> Teamwork</label>
                            <label><input type="checkbox" name="strength" value="Fairness"> Fairness</label>
                            <label><input type="checkbox" name="strength" value="Leadership"> Leadership</label>
                            <label><input type="checkbox" name="strength" value="Forgiveness"> Forgiveness</label>
                            <label><input type="checkbox" name="strength" value="Humility"> Humility</label>
                            <label><input type="checkbox" name="strength" value="Prudence"> Prudence</label>
                            <label><input type="checkbox" name="strength" value="Self-Regulation"> Self-Regulation</label>
                            <label><input type="checkbox" name="strength" value="Appreciation of Beauty"> Appreciation of Beauty</label>
                            <label><input type="checkbox" name="strength" value="Gratitude"> Gratitude</label>
                            <label><input type="checkbox" name="strength" value="Hope"> Hope</label>
                            <label><input type="checkbox" name="strength" value="Humor"> Humor</label>
                            <label><input type="checkbox" name="strength" value="Spirituality"> Spirituality</label>
                        </div>
                        <div class="form-group">
                            <label>How can you use your top strengths more in your daily life?</label>
                            <textarea id="strengths-application" placeholder="Reflect on specific ways to apply your strengths..." rows="5"></textarea>
                        </div>
                        <button class="btn btn-primary" id="save-strengths">Save Strengths</button>
                    </div>
                    <style>
                        .strengths-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 0.5rem;
                            margin: 1rem 0;
                            max-height: 200px;
                            overflow-y: auto;
                            border: 1px solid #e5e7eb;
                            padding: 1rem;
                            border-radius: 0.5rem;
                        }
                        .strengths-grid label {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            font-size: 0.9rem;
                        }
                    </style>
                `
            },
            'acts-kindness': {
                title: 'Acts of Kindness',
                description: 'Plan and reflect on acts of kindness you can perform.',
                form: `
                    <div class="exercise-form">
                        <h4>Acts of Kindness Planning</h4>
                        <p>Research shows that performing acts of kindness increases happiness for both the giver and receiver. Plan some acts of kindness you can do this week.</p>
                        <div class="form-group">
                            <label>Acts of kindness for family/friends:</label>
                            <textarea id="kindness-personal" placeholder="List specific kind acts for people close to you..." rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Acts of kindness for strangers/community:</label>
                            <textarea id="kindness-community" placeholder="List ways to help strangers or your community..." rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Acts of kindness for yourself:</label>
                            <textarea id="kindness-self" placeholder="Don't forget self-compassion - how will you be kind to yourself?" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Reflection on past acts of kindness:</label>
                            <textarea id="kindness-reflection" placeholder="Describe a time when you helped someone. How did it make you feel?" rows="4"></textarea>
                        </div>
                        <button class="btn btn-primary" id="save-kindness">Save Kindness Plan</button>
                    </div>
                `
            }
        };

        exerciseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const exercise = btn.dataset.exercise;
                this.loadPsychologyExercise(exercise, exercises[exercise]);
                
                exerciseBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        this.loadPsychologyExercise = (exerciseKey, exercise) => {
            exerciseContent.innerHTML = `
                <h3>${exercise.title}</h3>
                <p>${exercise.description}</p>
                ${exercise.form}
            `;

            // Add save functionality
            const saveBtn = exerciseContent.querySelector(`#save-${exerciseKey.replace('-', '-')}`);
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.savePsychologyExercise(exerciseKey);
                });
            }

            // Special handling for strengths exercise
            if (exerciseKey === 'strengths') {
                const checkboxes = exerciseContent.querySelectorAll('input[name="strength"]');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const checked = exerciseContent.querySelectorAll('input[name="strength"]:checked');
                        if (checked.length > 5) {
                            checkbox.checked = false;
                            this.showNotification('Please select only your top 5 strengths.', 'warning');
                        }
                    });
                });
            }
        };

        this.savePsychologyExercise = (exerciseKey) => {
            const entry = {
                exercise: exerciseKey,
                date: new Date().toISOString(),
                data: {}
            };

            // Collect form data based on exercise type
            switch (exerciseKey) {
                case 'three-good':
                    entry.data = {
                        goodThings: [
                            {
                                thing: document.getElementById('good-thing-1')?.value || '',
                                meaning: document.getElementById('meaning-1')?.value || ''
                            },
                            {
                                thing: document.getElementById('good-thing-2')?.value || '',
                                meaning: document.getElementById('meaning-2')?.value || ''
                            },
                            {
                                thing: document.getElementById('good-thing-3')?.value || '',
                                meaning: document.getElementById('meaning-3')?.value || ''
                            }
                        ]
                    };
                    break;
                case 'best-self':
                    entry.data = {
                        description: document.getElementById('best-self-description')?.value || '',
                        actionSteps: document.getElementById('action-steps')?.value || ''
                    };
                    break;
                case 'gratitude-letter':
                    entry.data = {
                        recipient: document.getElementById('gratitude-recipient')?.value || '',
                        letter: document.getElementById('gratitude-letter-content')?.value || '',
                        willSend: document.getElementById('will-send')?.checked || false
                    };
                    break;
                case 'strengths':
                    const selectedStrengths = Array.from(document.querySelectorAll('input[name="strength"]:checked'))
                        .map(cb => cb.value);
                    entry.data = {
                        strengths: selectedStrengths,
                        application: document.getElementById('strengths-application')?.value || ''
                    };
                    break;
                case 'acts-kindness':
                    entry.data = {
                        personal: document.getElementById('kindness-personal')?.value || '',
                        community: document.getElementById('kindness-community')?.value || '',
                        self: document.getElementById('kindness-self')?.value || '',
                        reflection: document.getElementById('kindness-reflection')?.value || ''
                    };
                    break;
            }

            // Save to localStorage
            const psychologyEntries = JSON.parse(localStorage.getItem('calmconnect_psychology') || '[]');
            psychologyEntries.push(entry);
            localStorage.setItem('calmconnect_psychology', JSON.stringify(psychologyEntries));

            this.showNotification('Exercise saved successfully! 🌟', 'success');
        };
    }

