const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("userInput"); 
const messagesDiv = document.getElementById("messages");

sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement("div");
  userDiv.className = "msg user";
  userDiv.innerText = text;
  messagesDiv.appendChild(userDiv);

  input.value = "";

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || `Server Error ${res.status}`);
    }

    const botDiv = document.createElement("div");
    botDiv.className = "msg gpt";
    botDiv.innerText = data.reply;
    messagesDiv.appendChild(botDiv);

    // Handle Steps
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
        steps.forEach(step => {
             const link = document.createElement("div");
             if (step.action === 'open_url') {
                link.innerHTML = `<a href="${step.value}" target="_blank">Open Link</a>`;
             } else {
                link.innerText = `Step ${step.step}: ${step.action}`;
             }
             stepsContainer.appendChild(link);
        });
        messagesDiv.appendChild(stepsContainer);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (err) {
    console.error("Chat error:", err);
    const errorDiv = document.createElement("div");
    errorDiv.className = "msg error";
    errorDiv.innerText = `Error: ${err.message}`;
    messagesDiv.appendChild(errorDiv);
  }
});
