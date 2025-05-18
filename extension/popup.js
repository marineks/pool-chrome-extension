// Constantes
const BACKEND_URL = "http://localhost:3000";
const GOAL = 200000;
const STORAGE_KEY = "total_swim";
const CONTRIBUTIONS_KEY = "swim_contributions";

// Elements
const progressFill = document.querySelector(".progress-fill");
const progressSwimmer = document.querySelector(".progress-swimmer");
const progressMeters = document.getElementById("progress-meters");
const progressPercent = document.getElementById("progress-percent");
const addBtn = document.getElementById("add-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.querySelector(".modal-content .close");
const validerBtn = document.getElementById("valider-btn");
const inputPrenom = document.getElementById("prenom");
const inputMetrage = document.getElementById("metrage");
const progressBar = document.querySelector(".progress-bar");

// Fonctions

const PRENOM_KEY = "prenom";
function savePrenom(prenom) {
  localStorage.setItem(PRENOM_KEY, prenom);
}
function getPrenom() {
  return localStorage.getItem(PRENOM_KEY) ?? "";
}

async function onSubmitPressed() {
  const prenom = inputPrenom.value.trim();
  const metrage = parseInt(inputMetrage.value, 10);
  if (!prenom || isNaN(metrage) || metrage <= 0) {
    inputMetrage.value = "";
    inputMetrage.placeholder = "Entrez un nombre valide";
    inputMetrage.focus();
    return;
  }

  savePrenom(prenom);

  const success = await addOneSwim(prenom, metrage);
  if (!success) return;

  inputMetrage.value = "";
  // Refetch data and rebuild UI
  const data = await fetchAllStats();
  await _buildUI(data);

  closeModal();
}

async function addOneSwim(prenom, metrage) {
  try {
    await fetch(`${BACKEND_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: prenom, meters: metrage }),
    });

    return true;
  } catch (e) {
    console.error("Erreur lors de l’envoi", e);
    return false;
  }
}

async function fetchAllStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/stats`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Erreur en récupérant les stats", e);
  }
}

async function _buildUI(data) {
  // const userName = getPrenom();
  // const userMeters = data.byUser?.[userName] ?? 0;

  updateProgressBar(data.total ?? 0);

  updateLeaderboard(data.leaderboard);
}

function updateLeaderboard(leaderboard) {
  const listElem = document.getElementById("leaderboard-list");
  leaderboard.forEach(({ name, meters }, i) => {
    const prenom = name;
    const total = meters;
    const li = document.createElement("li");
    li.textContent = `${prenom} : ${total.toLocaleString("fr-FR")} m`;
    listElem.appendChild(li);
  });
  if (leaderboard.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucun nageur pour le moment.";
    listElem.appendChild(li);
  }
}

// UPDATE PROGRESS BAR WITH SWIMMER ICON
function updateProgressBar(totalGroupSwim) {
  if (isNaN(totalGroupSwim)) {
    totalGroupSwim = 0;
  }
  // Adapt meters
  progressMeters.textContent = `${totalGroupSwim} / ${GOAL} m`;

  // Adapt percent
  const percent = Math.min((totalGroupSwim / GOAL) * 100, 100);

  progressPercent.textContent = `${percent.toFixed(1)}%`;
  // Adapt progress fill
  progressFill.style.width = percent + "%";

  // Adapt swimmer position
  const barWidth = progressBar.offsetWidth;
  const swimmerWidth = progressSwimmer.offsetWidth;
  let left = (percent / 100) * barWidth;
  // This calculation ensures that the swimmer icon is always centered in the progress bar,
  // even when the progress bar is resized.
  left = Math.max(
    swimmerWidth / 2,
    Math.min(left, barWidth - swimmerWidth / 2)
  );
  progressSwimmer.style.left = `${left}px`;
  progressSwimmer.style.top = "50%";
}

function openModal() {
  modal.style.display = "flex";
  inputMetrage.value = PRENOM_KEY ?? getPrenom();
  inputPrenom.focus();
}

function closeModal() {
  modal.style.display = "none";
}

// Event listeners
addBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
validerBtn.addEventListener("click", onSubmitPressed);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
inputMetrage.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSubmitPressed();
});
inputPrenom.addEventListener("keydown", (e) => {
  if (e.key === "Enter") inputMetrage.focus();
});

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
  inputPrenom.value = getPrenom();

  const data = await fetchAllStats();
  await _buildUI(data);
});
