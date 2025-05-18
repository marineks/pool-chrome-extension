// Constantes
const BACKEND_URL = "http://localhost:3000";
const GOAL = 200000;

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
const loginBtn = document.getElementById("login-btn");
const loginName = document.getElementById("login-name");
const loginCode = document.getElementById("login-code");
const loginError = document.getElementById("login-error");

// #############
// API handlers
// #############

async function login(name, code) {
  // Send login request
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, personalCode: code }),
  });
  const data = await res.json();
  return data;
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

// #############
// Local storage
// #############

// Stores the user name in the storage
function storeUserName(userName) {
  localStorage.setItem("logged_user", userName);
}

// Gets the user name from the storage
function getUserNameFromStorage() {
  const fetchedUserName = localStorage.getItem("logged_user") ?? "";
  return fetchedUserName;
}

// #############
// UI handlers
// #############

// Builds the content of the popup
async function _buildUI() {
  const data = await fetchAllStats();
  updateProgressBar(data.total ?? 0);
  updateLeaderboard(data.leaderboard);
  updatePersonalTotal(getUserNameFromStorage(), data.byUser);
}

// Builds the personal total meters
function updatePersonalTotal(userName, metersPerUser) {
  const personalTotalElem = document.getElementById("personal-total-meters");

  if (userName === "") {
    personalTotalElem.textContent = `Nageur.se inconnu.e`;
  } else {
    const personalTotal = metersPerUser?.[userName.toLowerCase()] ?? 0;
    personalTotalElem.textContent = `${personalTotal} m 💪`;
  }
}

// Builds the leaderboard
function updateLeaderboard(leaderboard) {
  const listElem = document.getElementById("leaderboard-list");

  // Reset the leaderboard first
  if (listElem.children.length > 0) {
    listElem.innerHTML = "";
  }
  // Append the new lines
  leaderboard.forEach(({ name, meters }, i) => {
    if (!meters || meters === 0) {
      return;
    }

    // Format the name
    const formattedName = formatUserName(name);

    const li = document.createElement("li");
    li.textContent = `${formattedName} : ${meters.toLocaleString("fr-FR")} m`;
    listElem.appendChild(li);
  });
  if (leaderboard.length === 0 || listElem.children.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucun nageur pour le moment.";
    listElem.appendChild(li);
  }
}

// Builds the progress bar with the swimmer icon
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

// ##########################
// User interaction handlers
// ##########################

// Handles the submission of the login form
async function onLoginPressed() {
  const nameInput = loginName.value.trim();
  const codeInput = loginCode.value.trim();
  const errorDiv = loginError;

  if (!nameInput || !codeInput) {
    errorDiv.textContent = "Veuillez remplir tous les champs.";
    errorDiv.style.display = "block";
    return;
  }

  const { success } = await login(nameInput, codeInput);

  if (success) {
    // Format the name
    const formattedName = formatUserName(nameInput);
    // Save user info
    storeUserName(formattedName);
    // Hide login, show main UI
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-ui").style.display = "";
    // Trigger the UI update
    await _buildUI();
  } else {
    errorDiv.textContent = data.message || "Erreur de connexion.";
    errorDiv.style.display = "block";
  }
}

// Handles the submission of a new swim
async function onSubmitPressed() {
  const prenom = inputPrenom.value.trim();
  const metrage = parseInt(inputMetrage.value, 10);
  if (!prenom || isNaN(metrage) || metrage <= 0) {
    inputMetrage.value = "";
    inputMetrage.placeholder = "Entrez un nombre valide";
    inputMetrage.focus();
    return;
  }

  const success = await addOneSwim(prenom, metrage);
  if (!success) return;

  inputMetrage.value = "";
  // Refetch data and rebuild UI
  await _buildUI();

  closeModal();
}

function openModal() {
  modal.style.display = "flex";
  inputMetrage.value = getUserNameFromStorage();
  inputPrenom.focus();
}

function closeModal() {
  modal.style.display = "none";
}

// Event listeners

// -- Click handlers
loginBtn.addEventListener("click", onLoginPressed);
validerBtn.addEventListener("click", onSubmitPressed);
addBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// -- Keydown handlers
inputMetrage.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSubmitPressed();
});
inputPrenom.addEventListener("keydown", (e) => {
  if (e.key === "Enter") inputMetrage.focus();
});

// -- Init (page load)
document.addEventListener("DOMContentLoaded", async () => {
  const userName = getUserNameFromStorage();
  inputPrenom.value = userName;

  // If the user is logged in, hide the login section and show the main UI
  if (userName) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-ui").style.display = "";
    await _buildUI();
  }
});

// ##########################
// Helper functions
// ##########################

function formatUserName(name) {
  // Put everything in lowercase first
  const lowerCaseName = name.toLowerCase();
  // Capitalize the first letter
  const capLetterUserName =
    lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.slice(1);
  return capLetterUserName;
}
