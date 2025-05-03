document.querySelectorAll(".preview-btn").forEach((button) => {
	button.addEventListener("click", () => {
		updateSelectedButton(button);
	})
});

function updateSelectedButton(selectedDevice) {
	document.querySelectorAll(".preview-btn").forEach((button) => {
		button.classList.remove ("selected")
	})
	selectedDevice.classList.add("selected");
}

