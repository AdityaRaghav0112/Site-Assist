// Styles adapted from style.css
const styles = `
#chat-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    width: 450px;
    height: 550px;
    background-color: #212121;
    color: #ffffff;
    display: none;
    flex-direction: column;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #333;
}

#chat-container.visible {
    display: flex;
}

#header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #000000;
    color: white;
    border-bottom: 1px solid #333;
}

#header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

#close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ffffff;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    padding: 4px 8px;
    width: auto;
    height: auto;
    border-radius: 6px;
    transition: background 0.2s;
}

#close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

#messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #212121;
}

.msg {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    max-width: 85%;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user {
    align-self: flex-end;
    background-color: #000000;
    color: #ffffff;
    border-bottom-right-radius: 4px;
}

.gpt {
    align-self: flex-start;
    background-color: #303030;
    color: #ffffff;
    border-bottom-left-radius: 4px;
}

.msg.error {
    background-color: #451a1a;
    color: #ff9999;
    border: 1px solid #7f1d1d;
}

.chat-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-self: flex-start;
    margin-top: 8px;
}

.chat-btn {
    padding: 8px 12px;
    border: 1px solid #444;
    background-color: #303030;
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    max-width: 200px;
    text-align: left;
}

.chat-btn:hover {
    background-color: #404040;
    border-color: #666;
}

.input-area {
    padding: 16px;
    background-color: #212121;
    border-top: 1px solid #333;
    display: flex;
    align-items: center;
    gap: 12px;
}

input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 24px;
    border: 1px solid #444;
    outline: none;
    font-size: 14px;
    background-color: #303030;
    color: #ffffff;
    transition: all 0.3s ease;
}

input::placeholder {
    color: #888;
}

input:focus {
    border-color: #666;
    background-color: #383838;
}

button.send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background-color: #ffffff;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

button.send-btn:hover {
    transform: scale(1.05);
    background-color: #f0f0f0;
}

button.send-btn:active {
    transform: scale(0.95);
}

button svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

#resizer {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 0;
    left: 0;
    cursor: nw-resize; /* North-West resize cursor */
    background-color: transparent;
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
}

#resizer svg {
    width: 14px;
    height: 14px;
    color: #666;
    transform: rotate(0deg); /* Adjust if needed to look like // */
    pointer-events: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #555;
}
`;

// Inject Widget
const host = document.createElement('div');
host.id = 'mongo-extension-host';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

const styleEl = document.createElement('style');
styleEl.textContent = styles;
shadow.appendChild(styleEl);

const container = document.createElement('div');
container.id = 'chat-container';
container.innerHTML = `
    <div id="header">
        <h3>Site Assistant</h3>
        <button id="close-btn" aria-label="Close chat">&times;</button>
    </div>
    <div id="messages"></div>
    <div class="input-area">
      <input id="userInput" placeholder="Ask something..." type="text" />
      <button id="sendBtn" class="send-btn">
        <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
    <div id="resizer">
        <!-- Tilted double bar icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="16" y1="3" x2="21" y2="3"></line>
            <line x1="16" y1="8" x2="21" y2="8"></line>
            <line x1="3" y1="21" x2="3" y2="16"></line>
            <line x1="8" y1="21" x2="8" y2="16"></line>
             <!-- Actually let's just make two diagonal lines for the corner grip -->
             <path d="M15 3 L21 9" />
             <path d="M9 3 L21 15" /> 
        </svg>
    </div>
`;
shadow.appendChild(container);

// Logic
const sendBtn = shadow.getElementById("sendBtn");
const closeBtn = shadow.getElementById("close-btn");
const input = shadow.getElementById("userInput");
const messagesDiv = shadow.getElementById("messages");
const resizer = shadow.getElementById("resizer");

// Update resizer icon to be more like a grip handle
const resizerIcon = resizer.querySelector('svg');
resizerIcon.innerHTML = `
    <path d="M4 4 L4 4" /> 
    <path d="M8 4 L4 8" />
    <path d="M12 4 L4 12" />
`;
// Let's use a simpler "grip" icon - usually diagonal lines in the corner
// Since it's top-left, the lines should range from top to left
resizerIcon.innerHTML = `
    <line x1="6" y1="6" x2="18" y2="18" stroke="#666" stroke-width="2" />
    <line x1="10" y1="6" x2="18" y2="14" stroke="#666" stroke-width="2" />
`;
// Okay, previous attempt at icon logic inside the JS string might be messy. 
// Let's stick to a clean diagonal double bar.
container.querySelector('#resizer').innerHTML = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 4L4 16" stroke="#888" stroke-width="2" stroke-linecap="round"/>
<path d="M20 8L8 20" stroke="#888" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

let isResizing = false;

// Resizer functionality
resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.userSelect = "none";
  e.stopPropagation(); // Prevent drag from bubbling
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  
  // Container is fixed bottom-right.
  // Top-left resizing means:
  // Width = RightEdge - MouseX
  // Height = BottomEdge - MouseY
  
  const rect = container.getBoundingClientRect();
  
  // Although rect.right/bottom might change as we resize, 
  // if we anchor to bottom/right via CSS, those should technically stay fixed relative to viewport
  // UNLESS the width/height change pushes them.
  // CSS is: bottom: 20px; right: 20px;
  // So bottom-right corner is always at (ViewportWidth - 20, ViewportHeight - 20)
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const rightEdge = viewportWidth - 20; 
  const bottomEdge = viewportHeight - 20;
  
  let newWidth = rightEdge - e.clientX;
  let newHeight = bottomEdge - e.clientY;
  
  // Constraints
  if (newWidth > 300 && newWidth < 800) {
    container.style.width = newWidth + "px";
  }
  if (newHeight > 300 && newHeight < 800) {
    container.style.height = newHeight + "px";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.userSelect = "auto";
});

// Loader / Typing Indicator functions
function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "msg gpt typing-indicator";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTyping() {
    const typingDiv = messagesDiv.querySelector("#typing-indicator");
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Close button logic
closeBtn.addEventListener("click", () => {
    container.classList.remove('visible');
});

sendBtn.addEventListener("click", () => handleUserAction());
input.addEventListener("keypress", (e) => {
    e.stopPropagation(); // Prevent site interference
    if (e.key === "Enter") handleUserAction();
});
input.addEventListener("keydown", (e) => e.stopPropagation());
input.addEventListener("keyup", (e) => e.stopPropagation());

function handleUserAction() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ""; // Clear input immediately
    processMessage(text);
}

async function processMessage(text, userAction = null) {
    if (!text) return;

    // 1. Render User Message
    const userDiv = document.createElement("div");
    userDiv.className = "msg user";
    userDiv.innerText = text;
    messagesDiv.appendChild(userDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Show typing indicator
    showTyping();

    // 2. Capture Page Context
    const url = window.location.href;
    const context = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || "",
        content: document.body.innerText.substring(0, 1500).replace(/\s+/g, " ").trim() // Truncated clean text
    };

    try {
        const res = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: text, 
                url, 
                userAction: userAction,
                context: context // Send captured context
            }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            throw new Error(data.error || `Server Error ${res.status}`);
        }

        // Hide typing indicator
        removeTyping();

        // 3. Render Bot Response
        const botDiv = document.createElement("div");
        botDiv.className = "msg gpt";
        botDiv.innerText = data.reply;
        messagesDiv.appendChild(botDiv);

        // 4. Render Buttons if available
        if (data.buttons && Array.isArray(data.buttons) && data.buttons.length > 0) {
            const btnContainer = document.createElement("div");
            btnContainer.className = "chat-buttons";

            data.buttons.forEach(label => {
                // If it's a string, use it. If it's an object with label/value, use label.
                const btnLabel = typeof label === 'object' ? label.label : label;
                const btnValue = typeof label === 'object' ? label.value : label;

                const btnEl = document.createElement("button");
                btnEl.className = "chat-btn";
                btnEl.innerText = btnLabel;
                btnEl.onclick = () => {
                   // When clicking a button:
                   // 1. Show the label as the user message
                   // 2. Send the label as 'userAction' to the backend
                   processMessage(btnLabel, btnLabel); 
                };
                btnContainer.appendChild(btnEl);
            });

            messagesDiv.appendChild(btnContainer);
        }

        // 5. Handle Automation Steps
        let steps = [];
        if (data.steps) {
            if (Array.isArray(data.steps)) {
                steps = data.steps;
            } else if (data.steps.steps && Array.isArray(data.steps.steps)) {
                steps = data.steps.steps;
            }
        }

        if (steps.length > 0) {
            const stepsContainer = document.createElement("div");
            stepsContainer.className = "msg gpt";
            stepsContainer.style.backgroundColor = "#166534"; // Darker green for dark mode
            stepsContainer.style.color = "#ecfdf5";
            stepsContainer.style.border = "1px solid #14532d";
            
            steps.forEach(step => {
                const stepLine = document.createElement("div");
                stepLine.style.marginBottom = "8px";
                
                if (step.action === 'open_url' && step.value) {
                    stepLine.innerHTML = `<strong>Step ${step.step}:</strong> <a href="${step.value}" target="_blank" style="color: #6ee7b7; text-decoration: underline;">Open ${step.value}</a>`;
                } else {
                    stepLine.innerHTML = `<strong>Step ${step.step}:</strong> ${step.action} - ${step.value}`;
                }
                stepsContainer.appendChild(stepLine);
            });
            messagesDiv.appendChild(stepsContainer);
        }

        messagesDiv.scrollTop = messagesDiv.scrollHeight;

    } catch (err) {
        console.error("Chat error:", err);
        removeTyping();
        const errorDiv = document.createElement("div");
        errorDiv.className = "msg error";
        errorDiv.innerText = `Error: ${err.message}`;
        messagesDiv.appendChild(errorDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Toggle Visibility
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TOGGLE_CHAT") {
        const isVisible = container.classList.contains('visible');
        if (isVisible) {
            container.classList.remove('visible');
        } else {
            container.classList.add('visible');
            setTimeout(() => input.focus(), 100);
        }
    }
});
