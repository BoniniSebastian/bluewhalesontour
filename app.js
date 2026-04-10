import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}

window.toggleAttend = async (matchId, btn) => {
  const userId = getUserId();
  const ref = doc(db, "matches", matchId, "attendees", userId);

  window.myStatus = window.myStatus || {};

  if (window.myStatus[matchId]) {
    await deleteDoc(ref);
    window.myStatus[matchId] = false;
    btn.style.background = "#1976d2";
  } else {
    await setDoc(ref, { going: true });
    window.myStatus[matchId] = true;
    btn.style.background = "green";
  }
};


// 🔥 GRUPPERA PER DAG
function groupByDate(matches) {
  const grouped = {};

  matches.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  return grouped;
}


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

  // sortera
  matches.sort((a, b) => a.time.localeCompare(b.time));

  const grouped = groupByDate(matches);

  Object.keys(grouped).forEach(date => {

    const day = document.createElement("div");
    day.innerHTML = `<div class="day">${date}</div>`;
    container.appendChild(day);

    grouped[date].forEach(m => {
      const el = document.createElement("div");
      el.className = "match-card";

      el.innerHTML = `
        <div>
          <b>${m.time}</b><br>
          ${m.team}<br>
          vs ${m.opponent}<br>
          ${m.location}
        </div>

        <div>
          <button onclick="toggleAttend('${m.id}', this)">👍</button>
          <div id="count-${m.id}">0</div>
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
