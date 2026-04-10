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


// DAGNAMN
function formatDay(dateStr) {
  const d = new Date(dateStr);
  const days = ["SÖNDAG","MÅNDAG","TISDAG","ONSDAG","TORSDAG","FREDAG","LÖRDAG"];
  return days[d.getDay()];
}


// HÄMTA MATCHER
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

  matches.sort((a, b) => a.time.localeCompare(b.time));

  const grouped = {};

  matches.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  Object.keys(grouped).forEach(date => {

    const day = document.createElement("div");
    day.innerHTML = `<div class="day">${formatDay(date)}</div>`;
    container.appendChild(day);

    grouped[date].forEach(m => {

      const el = document.createElement("div");
      el.className = "match-card";

      el.innerHTML = `
        <div>
          <div class="time">${m.time}</div>
          <div>${m.team}</div>
          <div>vs ${m.opponent}</div>
          <div class="location">${m.location}</div>
          <div class="attending">På plats: <span id="count-${m.id}">0</span></div>
        </div>

        <button class="attend-btn" onclick="toggleAttend('${m.id}', this)">
          ✔
        </button>
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
