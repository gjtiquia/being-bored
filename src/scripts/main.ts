// Event listeners
const beginButton = document.getElementById("beginBtn");
const doneButton = document.getElementById("doneBtn");
const settingsButton = document.getElementById("settingsBtn");
const closeSettingsButton = document.getElementById("closeSettingsBtn");
const resetButton = document.getElementById("resetBtn");
const durationSlider = document.getElementById(
    "durationSlider",
) as HTMLInputElement;
const durationValue = document.getElementById("durationValue");
const settingsModal = document.getElementById("settingsModal");

let timerId: number;
let currentDuration = 10;
let showCountdown = false;
let countdownInterval: number;

if (
    beginButton &&
    doneButton &&
    settingsButton &&
    closeSettingsButton &&
    resetButton &&
    durationSlider
) {
    beginButton.addEventListener("click", showBoredScreenAsync);
    doneButton.addEventListener("click", resetScreenAsync);
    settingsButton.addEventListener("click", showSettings);
    closeSettingsButton.addEventListener("click", closeSettings);
    resetButton.addEventListener("click", resetSettings);
    durationSlider.addEventListener("input", updateDuration);
}

const showCountdownToggle = document.getElementById(
    "showCountdownToggle",
) as HTMLInputElement;
if (showCountdownToggle) {
    showCountdownToggle.addEventListener("change", (e) => {
        showCountdown = (e.target as HTMLInputElement).checked;
    });
}

function showSettings() {
    if (!settingsModal) return;
    settingsModal.classList.remove("hidden");
}

function closeSettings() {
    if (!settingsModal) return;
    settingsModal.classList.add("hidden");
}

function resetSettings() {
    if (!durationSlider || !durationValue || !showCountdownToggle) return;
    currentDuration = 10;
    durationSlider.value = "10";
    durationValue.textContent = "10 min";
    showCountdown = false;
    showCountdownToggle.checked = false;
}

function updateDuration() {
    if (!durationSlider || !durationValue) return;
    currentDuration = parseInt(durationSlider.value);
    durationValue.textContent = `${currentDuration} min`;
}

function updateCountdown(endTime: number) {
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return;

    const now = new Date().getTime();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
        countdownElement.classList.add("hidden");
        clearInterval(countdownInterval);
        return;
    }

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdownElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

async function showBoredScreenAsync() {
    const heroElement = document.getElementById("hero");
    const boredElement = document.getElementById("boredScreen");
    const countdownElement = document.getElementById("countdown");

    if (!heroElement || !boredElement || !countdownElement) return;

    // Request fullscreen
    try {
        await document.documentElement.requestFullscreen();
    } catch (err) {
        console.log("Fullscreen request failed:", err);
    }

    // Hide cursor when bored screen is shown
    document.body.style.cursor = "none";

    heroElement.classList.add("hidden");
    boredElement.classList.remove("hidden");

    const duration = currentDuration * 60 * 1000; // in milliseconds

    // Setup countdown if enabled
    if (showCountdown) {
        countdownElement.classList.remove("hidden");
        const endTime = new Date().getTime() + duration;
        updateCountdown(endTime);
        countdownInterval = setInterval(() => updateCountdown(endTime), 1000);
    }

    // Start timer
    timerId = setTimeout(() => {
        const modalElement = document.getElementById("completionModal");
        if (!modalElement) return;

        modalElement.classList.remove("hidden");
        clearInterval(countdownInterval);

        // Show cursor when completion modal appears
        document.body.style.cursor = "auto";
    }, duration);
}

async function resetScreenAsync() {
    const modalElement = document.getElementById("completionModal");
    const boredElement = document.getElementById("boredScreen");
    const heroElement = document.getElementById("hero");

    if (!modalElement || !boredElement || !heroElement) return;

    // Exit fullscreen
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
        } catch (err) {
            console.log("Exit fullscreen failed:", err);
        }
    }

    // Ensure cursor is visible when returning to main screen
    document.body.style.cursor = "auto";

    modalElement.classList.add("hidden");
    boredElement.classList.add("hidden");
    heroElement.classList.remove("hidden");

    clearTimeout(timerId);
    clearInterval(countdownInterval);
}

// Add keyboard event listener for Escape key
document.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
        const boredElement = document.getElementById("boredScreen");
        // Only handle Escape if we're in the bored screen
        if (boredElement && !boredElement.classList.contains("hidden")) {
            await resetScreenAsync();
        }
    }
});

// Handle fullscreen exit
document.addEventListener("fullscreenchange", async () => {
    if (!document.fullscreenElement) {
        const boredElement = document.getElementById("boredScreen");
        // Only reset if we're in the bored screen
        if (boredElement && !boredElement.classList.contains("hidden")) {
            await resetScreenAsync();
        }
    }
}); 