        const messagesArea = document.getElementById('messagesArea');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const configToggle = document.getElementById('configToggle');
        const apiConfig = document.getElementById('apiConfig');
        const apiEndpoint = document.getElementById('apiEndpoint');
        const saveApiBtn = document.getElementById('saveApiBtn');
        const currentApi = document.getElementById('currentApi');
        const apiStatus = document.getElementById('apiStatus');
        const toggleConfig = document.getElementById('toggleConfig');

        // Current API (default to your API)
        let currentAPI = 'https://api.yupra.my.id/api/ai/ypai?text=';

        // Auto-resize textarea
        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }

        // Format time
        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Add message to chat
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
            
            const headerContent = isUser ? 
                '<i class="fas fa-user"></i><span>You</span>' : 
                '<i class="fas fa-robot"></i><span>Riss AI</span>';
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    ${headerContent}
                </div>
                <div class="message-content">${content}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
            
            messagesArea.appendChild(messageDiv);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        // Show typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            messagesArea.appendChild(typingDiv);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        // Hide typing indicator
        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Test API connection
        async function testAPIConnection(apiUrl) {
            try {
                const testMessage = "Hello";
                const response = await fetch(apiUrl + encodeURIComponent(testMessage));
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                return { success: true, data: data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        // Send message to API
        async function sendToAPI(message) {
            try {
                showTypingIndicator();
                
                // Add delay for realism
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const response = await fetch(currentAPI + encodeURIComponent(message), {
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                hideTypingIndicator();
                
                // Handle different API response formats
                if (data.response || data.answer || data.text || data.result) {
                    return data.response || data.answer || data.text || data.result;
                } else if (data.data && data.data.response) {
                    return data.data.response;
                } else if (typeof data === 'string') {
                    return data;
                } else {
                    return "I received your message: '" + message + "'. How can I assist you further?";
                }
                
            } catch (error) {
                hideTypingIndicator();
                console.error('API Error:', error);
                
                // Test the API
                const testResult = await testAPIConnection(currentAPI);
                
                if (!testResult.success) {
                    apiStatus.textContent = "API Error - Click settings to change";
                    apiStatus.style.color = "#ef4444";
                    
                    return "API connection error. Please check your API endpoint in settings. Current API: " + currentAPI;
                }
                
                const fallbacks = [
                    "I understand you asked: '" + message + "'. Could you provide more details?",
                    "Let me help you with: " + message,
                    "Regarding your question about '" + message + "', here's what I think..."
                ];
                
                return fallbacks[Math.floor(Math.random() * fallbacks.length)];
            }
        }

        // Handle sending message
        async function sendMessage() {
            const message = messageInput.value.trim();
            
            if (!message) return;
            
            addMessage(message, true);
            messageInput.value = '';
            autoResize(messageInput);
            
            sendButton.disabled = true;
            const aiResponse = await sendToAPI(message);
            addMessage(aiResponse, false);
            sendButton.disabled = false;
            messageInput.focus();
        }

        // Update API display
        function updateAPIDisplay() {
            currentApi.textContent = currentAPI;
            apiEndpoint.value = currentAPI;
            apiStatus.textContent = "Connected";
            apiStatus.style.color = "#10b981";
        }

        // Save API endpoint
        async function saveAPIEndpoint() {
            const newEndpoint = apiEndpoint.value.trim();
            
            if (!newEndpoint) {
                alert('Please enter a valid API endpoint');
                return;
            }
            
            // Validate URL format
            if (!newEndpoint.includes('http') || !newEndpoint.includes('text=')) {
                if (!confirm('API endpoint might not be in correct format. Continue?')) {
                    return;
                }
            }
            
            // Test the new API
            apiStatus.textContent = "Testing connection...";
            apiStatus.style.color = "#f59e0b";
            
            const testResult = await testAPIConnection(newEndpoint);
            
            if (testResult.success) {
                currentAPI = newEndpoint;
                updateAPIDisplay();
                apiConfig.classList.remove('show');
                
                addMessage(`API endpoint updated successfully to: ${newEndpoint}`, false);
            } else {
                apiStatus.textContent = "Connection failed";
                apiStatus.style.color = "#ef4444";
                alert('Failed to connect to API. Please check the URL and try again.');
            }
        }

        // Event Listeners
        sendButton.addEventListener('click', sendMessage);

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // API Config toggle
        configToggle.addEventListener('click', () => {
            apiConfig.classList.toggle('show');
        });

        toggleConfig.addEventListener('click', () => {
            apiConfig.classList.toggle('show');
        });

        saveApiBtn.addEventListener('click', saveAPIEndpoint);

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', () => {
                const example = button.getAttribute('data-example');
                messageInput.value = example;
                autoResize(messageInput);
                messageInput.focus();
            });
        });

        // Close config when clicking outside
        document.addEventListener('click', (e) => {
            if (!apiConfig.contains(e.target) && !configToggle.contains(e.target) && !toggleConfig.contains(e.target)) {
                apiConfig.classList.remove('show');
            }
        });

        // Initialize
        window.addEventListener('load', () => {
            updateAPIDisplay();
            messageInput.focus();
            
            // Add welcome message
            setTimeout(() => {
                addMessage("Tip: You can change the API endpoint anytime using the settings button (⚙️) below", false);
            }, 1000);
        });
