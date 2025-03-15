const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAk-68DQ-h5W4cM_H9AN-ln2lPllXrObIs', 
    endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent'
};

class FitworxChatbot {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.messageHistory = [];
        
        this.addWaveAnimation();
        
        this.initializeEventListeners();
        this.addMessage("Hi! I'm your FitworxAI assistant. I can help you with workout plans, nutrition advice, and fitness tips. What would you like to know?", true);
    }

    addWaveAnimation() {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes wave {
                0% { transform: translateY(0px); }
                25% { transform: translateY(-5px); }
                50% { transform: translateY(0px); }
                75% { transform: translateY(5px); }
                100% { transform: translateY(0px); }
            }
            @keyframes pulse-ring {
                0% { transform: scale(0.7); opacity: 0.5; }
                50% { transform: scale(1); opacity: 0.2; }
                100% { transform: scale(0.7); opacity: 0.5; }
            }
            @keyframes gradient-flow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .wave-text {
                display: inline-block;
                animation: wave 2s infinite;
            }
            .gradient-animate {
                background: linear-gradient(90deg, #f97316, #ea580c, #f97316);
                background-size: 200% 200%;
                animation: gradient-flow 2s infinite;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    async handleSend() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, false);
        this.chatInput.value = '';
        this.messageHistory.push({ role: 'user', content: message });

        // typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${GEMINI_CONFIG.endpoint}?key=${GEMINI_CONFIG.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: "You are a knowledgeable fitness assistant. Provide helpful, accurate, and concise advice about workouts, nutrition, and general fitness. Keep responses under 100 words."
                                }
                            ]
                        },
                        {
                            role: "user",
                            parts: [{ text: message }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 150,
                    }
                })
            });

            const data = await response.json();
            const botResponse = data.candidates[0].content.parts[0].text;
            
            this.messageHistory.push({ role: 'assistant', content: botResponse });
            this.removeTypingIndicator();
            this.addMessage(botResponse, true);

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage(this.getOfflineResponse(message), true);
        }
    }

    addMessage(text, isBot) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`;
        
        const bubble = document.createElement('div');
        bubble.className = `max-w-[80%] p-4 rounded-xl shadow-md ${
            isBot 
                ? 'bg-gray-700 text-gray-100' 
                : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white'
        }`;
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'flex justify-start mb-4';
        indicator.innerHTML = `
            <div class="relative flex items-center gap-4 bg-gray-700 p-4 rounded-xl shadow-md overflow-hidden group">
                <!-- Animated background effect -->
                <div class="absolute inset-0 opacity-10 gradient-animate"></div>
                
                <!-- AI Avatar -->
                <div class="relative">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <!-- Pulse rings -->
                    <div class="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-[pulse-ring_2s_infinite]"></div>
                    <div class="absolute inset-0 rounded-full border-2 border-orange-500/10 animate-[pulse-ring_2s_infinite_0.5s]"></div>
                </div>

                <!-- Typing animation container -->
                <div class="flex flex-col items-start gap-1">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-orange-500">FitworxAI</span>
                        <span class="text-xs text-gray-400">is crafting your response</span>
                    </div>
                    
                    <!-- Dynamic dots -->
                    <div class="flex items-center gap-1">
                        ${Array.from({length: 4}, (_, i) => `
                            <div class="wave-text" style="animation-delay: ${i * 0.1}s">
                                <div class="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Energetic particles -->
                <div class="absolute inset-0 flex items-center justify-center opacity-20">
                    ${Array.from({length: 3}, (_, i) => `
                        <div class="absolute w-1 h-1 bg-orange-500 rounded-full"
                             style="animation: wave ${1 + i * 0.2}s infinite ${i * 0.1}s; left: ${20 + i * 30}%">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        indicator.id = 'typing-indicator';
        this.chatContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        // focus/blur effects for input
        this.chatInput.addEventListener('focus', () => {
            this.chatInput.classList.add('ring-2', 'ring-orange-600/20');
        });
        this.chatInput.addEventListener('blur', () => {
            this.chatInput.classList.remove('ring-2', 'ring-orange-600/20');
        });
    }

    getOfflineResponse(message) {
        const responses = {
            default: "I can help you with workout plans, nutrition advice, and fitness tips. What would you like to know?",
            workout: "I recommend starting with a full-body workout 3 times a week. Would you like a specific workout plan?",
            nutrition: "A balanced diet is key to fitness success. Make sure to include protein, complex carbs, and healthy fats.",
            schedule: "The best time to work out is when you can consistently do it. Morning workouts can help establish a routine."
        };

        if (message.toLowerCase().includes('workout')) return responses.workout;
        if (message.toLowerCase().includes('nutrition')) return responses.nutrition;
        if (message.toLowerCase().includes('schedule')) return responses.schedule;
        return responses.default;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new FitworxChatbot();
});