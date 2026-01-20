const messagesArea = document.getElementById("messagesArea");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const API_URL = "https://api.yupra.my.id/api/ai/ypai?text=";

function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage(text, user = false) {
    const div = document.createElement("div");
    div.className = `message ${user ? "user" : "ai"}`;
    div.innerHTML = `
        <div class="message-header">
            <i class="fas ${user ? "fa-user" : "fa-robot"}"></i>
            ${user ? "You" : "Riss AI"}
        </div>
        <div>${text}</div>
        <div class="message-time">${getTime()}</div>
    `;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    messageInput.value = "";
    sendButton.disabled = true;

    try {
        const res = await fetch(API_URL + encodeURIComponent(text));
        const data = await res.json();
        addMessage(data.response || "No response");
    } catch {
        addMessage("Error connecting to AI.");
    }

    sendButton.disabled = false;
}

sendButton.onclick = sendMessage;

messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
