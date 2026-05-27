const socket = io();

const messages = document.getElementById("messages");

// Load previous logs
fetch("/logs")
.then(res => res.json())
.then(data => {

    data.forEach(addMessage);

});

// Real-time updates
socket.on("newMessage", (data) => {

    addMessage(data);

});

function addMessage(data) {

    const div = document.createElement("div");

    const jammed = data.snr < 0;

    div.className = jammed ? "card jammed" : "card free";

    div.innerHTML = `

        <h2>${data.payload}</h2>

        <p>📶 Channel: ${data.channel}</p>

        <p>📡 RSSI: ${data.rssi}</p>

        <p>📈 SNR: ${data.snr}</p>

        <p>🎯 Selected: ${data.selectedChannel}</p>

        <p>🧠 Status: ${jammed ? "JAMMED" : "FREE"}</p>

        <p class="time">${data.time}</p>

    `;

    messages.prepend(div);

}