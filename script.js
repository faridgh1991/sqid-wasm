// --- 1. Start WebAssembly loading immediately ---
const go = new Go();
const wasmPromise = WebAssembly.instantiateStreaming(fetch("sqids.wasm"), go.importObject);

// --- 2. Create a promise that resolves when the DOM is ready ---
const domReadyPromise = new Promise(resolve => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve, {once: true});
    } else {
        resolve();
    }
});

// --- 3. Run after WASM and DOM are both ready ---
Promise.all([wasmPromise, domReadyPromise]).then(([wasmResult]) => {
    go.run(wasmResult.instance);
    console.log("WASM Module and DOM are both ready.");

    // --- Application State ---
    let state = {
        sourceMode: 'number', targetMode: 'sqid'
    };

    // --- DOM Element Selection ---
    const sourceInput = document.getElementById("sourceInput");
    const outputDiv = document.getElementById("output");
    const outputContainer = document.getElementById("output-container");
    const panelInput = document.getElementById("panel-input");
    const swapBtn = document.getElementById("swapBtn");
    const copyBtn = document.getElementById("copyBtn");
    const sourceModeTabs = document.getElementById("source-mode-tabs");
    const charCount = document.getElementById("charCount");

    // --- Event Listeners ---
    sourceInput.addEventListener("input", handleConversion);
    sourceInput.addEventListener("focus", () => panelInput.classList.add('focused'));
    sourceInput.addEventListener("blur", () => panelInput.classList.remove('focused'));
    swapBtn.addEventListener("click", handleSwap);
    copyBtn.addEventListener("click", () => copyToClipboard(outputDiv.textContent, copyBtn));

    sourceModeTabs.addEventListener("click", (e) => {
        if (e.target.matches(".mode-tab")) {
            state.sourceMode = e.target.dataset.mode;
            state.targetMode = state.sourceMode === 'number' ? 'sqid' : 'number';
            updateUI();
            handleConversion();
        }
    });

    // --- Core Functions ---
    function handleConversion() {
        const inputText = sourceInput.value.trim();
        outputContainer.classList.toggle('input-has-text', inputText.length > 0);
        charCount.textContent = `${sourceInput.value.length} / 5000`;

        outputDiv.innerHTML = '';
        outputDiv.className = 'text-area result-box'; // Reset class and keep result-box for styling

        if (!inputText) return;

        let result;
        let error = null;

        if (state.sourceMode === 'number') {
            if (!/^\d+$/.test(inputText)) {
                error = "Input must be a valid positive number.";
            } else {
                result = encodeSqid(inputText);
            }
        } else { // sourceMode is 'sqid'
            result = decodeSqid(inputText);
            if (!result) {
                error = "Not a valid Sqid. Check for invalid characters or length.";
            }
        }

        if (error) {
            outputDiv.textContent = error;
            outputDiv.classList.add('error-box');
        } else {
            outputDiv.textContent = result;
            outputDiv.classList.remove('error-box');
        }
    }

    function handleSwap() {
        const currentOutput = !outputDiv.classList.contains('error-box') ? outputDiv.textContent : '';
        [state.sourceMode, state.targetMode] = [state.targetMode, state.sourceMode];
        sourceInput.value = currentOutput;
        updateUI();
        handleConversion();
        sourceInput.focus();
    }

    function updateUI() {
        document.querySelectorAll('.mode-tab').forEach(tab => {
            const isSourceTab = tab.parentElement.id === 'source-mode-tabs';
            const isActive = isSourceTab ? tab.dataset.mode === state.sourceMode : tab.dataset.mode === state.targetMode;
            tab.classList.toggle('active', isActive);
        });

        sourceInput.placeholder = state.sourceMode === 'number' ? "Enter a number to encode..." : "Enter a Sqid to decode...";
    }

    function copyToClipboard(text, button) {
        if (!text || outputDiv.classList.contains('error-box')) return;
        navigator.clipboard.writeText(text).then(() => {
            button.classList.add("copied");
            setTimeout(() => {
                button.classList.remove("copied");
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    // --- Initial UI Setup on Load ---
    updateUI();

}).catch((err) => {
    console.error("Failed to initialize the application:", err);
    document.body.innerHTML = `<p style="color: red; text-align: center; padding: 50px;"><strong>Error:</strong> Application could not start. Please check the console.</p>`;
});
