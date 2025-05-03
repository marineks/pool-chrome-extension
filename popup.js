// Constantes
const GOAL = 200000;
const STORAGE_KEY = 'total_swim';
const CONTRIBUTIONS_KEY = 'swim_contributions';

// Elements
const progressFill = document.querySelector('.progress-fill');
const progressSwimmer = document.querySelector('.progress-swimmer');
const progressMeters = document.getElementById('progress-meters');
const progressPercent = document.getElementById('progress-percent');
const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.querySelector('.modal-content .close');
const validerBtn = document.getElementById('valider-btn');
const inputPrenom = document.getElementById('prenom');
const inputMetrage = document.getElementById('metrage');
const progressBar = document.querySelector('.progress-bar');

// Fonctions
function getTotalSwim() {
	return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
}

function setTotalSwim(val) {
	localStorage.setItem(STORAGE_KEY, val);
}

function getContributions() {
	try {
		return JSON.parse(localStorage.getItem(CONTRIBUTIONS_KEY)) || [];
	} catch {
		return [];
	}
}

function addContribution(prenom, metrage) {
	const list = getContributions();
	list.push({ prenom, metrage });
	localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(list));
}

function getLeaderboard() {
	const list = getContributions();
	// Regrouper par prénom et sommer
	const map = {};
	list.forEach(({ prenom, metrage }) => {
		if (!map[prenom]) map[prenom] = 0;
		map[prenom] += metrage;
	});
	// Transformer en tableau, trier, prendre top 3
	return Object.entries(map)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);
}

function updateLeaderboard() {
	const leaderboard = getLeaderboard();
	const listElem = document.getElementById('leaderboard-list');
	listElem.innerHTML = '';
	leaderboard.forEach(([prenom, total], i) => {
		const li = document.createElement('li');
		li.textContent = `${prenom} : ${total.toLocaleString('fr-FR')} m`;
		listElem.appendChild(li);
	});
	if (leaderboard.length === 0) {
		const li = document.createElement('li');
		li.textContent = 'Aucun nageur pour le moment.';
		listElem.appendChild(li);
	}
}

let lastSwimmerLeft = 0; // Pour mémoriser la dernière position du nageur

function updateProgressBar() {
	const total = getTotalSwim();
	const percent = Math.min((total / GOAL) * 100, 100);
	progressFill.style.width = percent + '%';
	progressMeters.textContent = `${total.toLocaleString('fr-FR')} / ${GOAL.toLocaleString('fr-FR')} m`;
	progressPercent.textContent = `${percent.toFixed(1)}%`;
	// Déplacer le nageur directement
	const barWidth = progressBar.offsetWidth;
	const swimmerWidth = progressSwimmer.offsetWidth;
	let left = (percent / 100) * barWidth;
	left = Math.max(swimmerWidth / 2, Math.min(left, barWidth - swimmerWidth / 2));
	progressSwimmer.style.left = `${left}px`;
	progressSwimmer.style.top = '50%';
	updateLeaderboard();
}

function openModal() {
	modal.style.display = 'flex';
	inputPrenom.value = '';
	inputMetrage.value = '';
	inputPrenom.focus();
}

function closeModal() {
	modal.style.display = 'none';
}

function handleValider() {
	const prenom = inputPrenom.value.trim();
	const metrage = parseInt(inputMetrage.value, 10);
	if (!prenom || isNaN(metrage) || metrage <= 0) {
		inputMetrage.value = '';
		inputMetrage.placeholder = 'Entrez un nombre valide';
		inputMetrage.focus();
		return;
	}
	// Ajouter au total
	const total = getTotalSwim() + metrage;
	setTotalSwim(total);
	addContribution(prenom, metrage);
	updateProgressBar();
	closeModal();
}

// Event listeners
addBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
validerBtn.addEventListener('click', handleValider);
modal.addEventListener('click', (e) => {
	if (e.target === modal) closeModal();
});
inputMetrage.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') handleValider();
});
inputPrenom.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') inputMetrage.focus();
});

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
	updateProgressBar();
	updateLeaderboard();
});
window.addEventListener('resize', updateProgressBar);

