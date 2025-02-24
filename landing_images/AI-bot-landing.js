const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAk-68DQ-h5W4cM_H9AN-ln2lPllXrObIs', 
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

class FitworxChatbot {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.messageHistory = [];
        
        this.initializeEventListeners();
        this.addMessage("Hi! I'm your FitworxAI assistant. I can help you with workout plans, nutrition advice, and fitness tips. What would you like to know?", true);
    }

    async handleSend() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, false);
        this.chatInput.value = '';
        this.messageHistory.push({ role: 'user', content: message });

        // Show typing indicator
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
        messageDiv.className = `flex ${isBot ? 'justify-start' : 'justify-end'}`;
        
        const bubble = document.createElement('div');
        bubble.className = `max-w-[80%] p-3 rounded-lg ${
            isBot ? 'bg-orange-50 text-gray-800' : 'bg-orange-600 text-white'
        }`;
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'flex justify-start';
        indicator.innerHTML = `
            <div class="bg-orange-50 p-3 rounded-lg">
                <div class="flex space-x-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
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