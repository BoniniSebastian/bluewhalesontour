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


// 🔑 unik användare
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}


// 🪟 popup
window.openPopup = (type) => {
  document.getElementById(type + "-popup").classList.remove("hidden");
};

window.closePopup = () => {
  document.querySelectorAll(".popup").forEach(p => p.classList.add("hidden"));
};


// 💬 BLUEWALL
window.addPost = async () => {
  const input = document.getElementById("postInput");
  if (!input.value) return;

  await addDoc(collection(db, "posts"), {
    text: input.value,
    createdAt: Date.now()
  });

  input.value = "";
};

onSnapshot(
  query(collection(db, "posts"), orderBy("createdAt", "desc")),
  (snap) => {
    const div = document.getElementById("posts");
    div.innerHTML = "";

    snap.forEach(doc => {
      const p = doc.data();
      div.innerHTML += `
        <p>${p.text}<br>
        <small>${new Date(p.createdAt).toLocaleString()}</small></p>
      `;
    });
  }
);


// 👍 MATCH – toggle + färg
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


// 📅 MATCHER
onSnapshot(collection(db, "matches"), (snap) => {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  snap.forEach(docSnap => {
    const m = docSnap.data();

    const el = document.createElement("div");
    el.className = "match-card";

    el.innerHTML = `
      <div class="match-info">
        <b>${m.time}</b><br>
        ${m.team}<br>
        vs ${m.opponent}<br>
        ${m.location}
      </div>

      <div>
        <button onclick="toggleAttend('${docSnap.id}', this)">👍</button>
        <div id="count-${docSnap.id}">0</div>
      </div>
    `;

    container.appendChild(el);

    // 🔢 counter live
    onSnapshot(
      collection(db, "matches", docSnap.id, "attendees"),
      (s) => {
        document.getElementById("count-" + docSnap.id).innerText = s.size;
      }
    );
  });
});
