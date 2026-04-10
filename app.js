import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// USER
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}

// POPUP
window.openPopup = (type) => {
  document.getElementById(type + "-popup").classList.remove("hidden");
};

window.closePopup = () => {
  document.querySelectorAll(".popup").forEach(p => p.classList.add("hidden"));
};

// BLUEWALL
window.addPost = async () => {
  const input = document.getElementById("postInput");
  if (!input.value) return;

  await addDoc(collection(db, "posts"), {
    text: input.value,
    createdAt: Date.now()
  });

  input.value = "";
};

let posts = [];
let index = 0;

onSnapshot(
  query(collection(db, "posts"), orderBy("createdAt", "desc")),
  (snap) => {
    posts = [];
    snap.forEach(doc => posts.push(doc.data().text));
  }
);

setInterval(() => {
  if (posts.length === 0) return;
  document.getElementById("bluewallPreview").innerText = posts[index];
  index = (index + 1) % posts.length;
}, 3000);

// MATCH
window.toggleAttend = async (matchId, btn) => {
  const userId = getUserId();
  const ref = doc(db, "matches", matchId, "attendees", userId);

  window.myStatus = window.myStatus || {};

  if (window.myStatus[matchId]) {
    await deleteDoc(ref);
    window.myStatus[matchId] = false;
    btn.style.opacity = 0.5;
  } else {
    await setDoc(ref, { going: true });
    window.myStatus[matchId] = true;
    btn.style.opacity = 1;
  }
};

// DAG
function formatDay(day) {
  const map = {
    fredag: "FREDAG",
    lördag: "LÖRDAG",
    söndag: "SÖNDAG"
  };
  return map[day] || day;
}

// MATCHER
onSnapshot(collection(db, "matches"), (snap) => {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  let matches = [];

  snap.forEach(docSnap => {
    matches.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  const grouped = {};

  matches.forEach(m => {
    if (!grouped[m.day]) grouped[m.day] = [];
    grouped[m.day].push(m);
  });

  Object.keys(grouped).forEach(day => {

    const dayEl = document.createElement("div");
    dayEl.innerHTML = `<div class="day">${formatDay(day)}</div>`;
    container.appendChild(dayEl);

    grouped[day].forEach(m => {

      const el = document.createElement("div");
      el.className = "match-card";

      el.innerHTML = `
        <div>
          <div class="time">${m.time}</div>
          <div>${m.team}</div>
          <div>vs ${m.opponent}</div>
          <div class="location">${m.location}</div>
        </div>

        <div class="attend-box">
          <button class="attend-btn" onclick="toggleAttend('${m.id}', this)">
            ✔
          </button>
          <div class="attend-count">
            <span id="count-${m.id}">0</span>
            <div class="attend-label">Ska se matchen live</div>
          </div>
        </div>
      `;

      container.appendChild(el);

      onSnapshot(
        collection(db, "matches", m.id, "attendees"),
        (s) => {
          document.getElementById("count-" + m.id).innerText = s.size;
        }
      );
    });
  });
});
