




const socket = io();

const senderBox = document.querySelector("#senderBox");
const receiverBox = document.querySelector("#receiverBox");

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
    div.className = "card";

    const jammed = data.snr < 0;

    div.innerHTML = `
        <h3>${data.payload}</h3>
        <p>📶 Channel: ${data.channel}</p>
        <p>📡 RSSI: ${data.rssi}</p>
        <p>📈 SNR: ${data.snr}</p>
        <p>🎯 Selected: ${data.selectedChannel}</p>
        <p>🧠 Status: ${jammed ? "JAMMED" : "FREE"}</p>
        <p>⏱ ${data.time}</p>
    `;

    // ===== SPLIT LOGIC =====

    if (data.role === "sender") {

        senderBox.innerHTML = "";   // ONLY latest
        senderBox.appendChild(div);

    } else if (data.role === "receiver") {

        receiverBox.innerHTML = "";  // ONLY latest
        receiverBox.appendChild(div);
    }
}