const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newConversationBtn = document.getElementById('new-conversation-btn');
const conversationHistory = document.getElementById('conversation-history');
const currentConversationTitle = document.getElementById('current-conversation-title');

let conversations = [];
let currentConversationId = null;

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    messageElement.textContent = isUser ? message : '';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (!isUser) {
        typeMessage(messageElement, message);
    }

    if (currentConversationId !== null) {
        const conversationIndex = conversations.findIndex(conv => conv.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversations[conversationIndex].messages.push({ content: message, isUser });
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
    }
}

function typeMessage(element, message) {
    element.classList.add('typing-animation');
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < message.length) {
            element.textContent += message.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            element.classList.remove('typing-animation');
        }
    }, 20);
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        try {
            const response = await callChatbotAPI(message);
            addMessage(response, false);

            if (currentConversationId !== null && conversations[conversations.length - 1].id === currentConversationId && conversations[conversations.length - 1].title === 'New Conversation') {
                const conversationIndex = conversations.findIndex(conv => conv.id === currentConversationId);
                conversations[conversationIndex].title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                updateConversationHistory();
                currentConversationTitle.textContent = conversations[conversationIndex].title;
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage("I apologize, but I encountered an error while processing your request. Please try again.", false);
        }
    }
}

async function callChatbotAPI(message) {
    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'x-rapidapi-key': 'c946bb8890msh5e01c2bb1492068p162a0bjsnbd45f7fe58e1'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ],
            model: "gpt-4-turbo-2024-04-09",
            max_tokens: 150,
            temperature: 0.7
        })
    };
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function createNewConversation() {
    currentConversationId = Date.now();
    conversations.push({ id: currentConversationId, title: 'New Conversation', messages: [] });
    updateConversationHistory();
    chatMessages.innerHTML = '';
    currentConversationTitle.textContent = 'New Conversation';
    addMessage("Greetings. I'm Kasa7GPT, your professional AI assistant. How may I assist you today?", false);
}

function updateConversationHistory() {
    conversationHistory.innerHTML = '';
    conversations.slice().reverse().forEach(conv => {
        const convElement = document.createElement('div');
        convElement.classList.add('conversation-history-item');
        convElement.textContent = conv.title;
        convElement.addEventListener('click', () => loadConversation(conv.id));
        conversationHistory.appendChild(convElement);
    });
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function loadConversation(conversationId) {
    currentConversationId = conversationId;
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        chatMessages.innerHTML = '';
        conversation.messages.forEach(msg => addMessage(msg.content, msg.isUser));
        currentConversationTitle.textContent = conversation.title;
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('input', () => {
    sendButton.style.opacity = userInput.value.trim() ? '1' : '0.5';
});

newConversationBtn.addEventListener('click', createNewConversation);

const savedConversations = localStorage.getItem('conversations');
if (savedConversations) {
    conversations = JSON.parse(savedConversations);
    updateConversationHistory();
    if (conversations.length > 0) {
        loadConversation(conversations[conversations.length - 1].id);
    } else {
        createNewConversation();
    }
} else {
    createNewConversation();
}