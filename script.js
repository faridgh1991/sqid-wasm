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

    // ⚡ Bolt: Cache previously computed values to avoid synchronous WASM boundary execution penalty
    const conversionCache = new Map();
    // ⚡ Bolt: Track normalized inputs to prevent redundant processing pipelines
    let lastProcessedKey = '';

    // --- DOM Element Selection ---
    const sourceInput = document.getElementById("sourceInput");
    const outputDiv = document.getElementById("output");
    const outputContainer = document.getElementById("output-container");
    const panelInput = document.getElementById("panel-input");
    const swapBtn = document.getElementById("swapBtn");
    const copyBtn = document.getElementById("copyBtn");
    const sourceModeTabs = document.getElementById("source-mode-tabs");
    const charCount = document.getElementById("charCount");
    const randomBtn = document.getElementById("randomBtn");

    // --- Event Listeners ---
    sourceInput.addEventListener("input", handleConversion);
    sourceInput.addEventListener("focus", () => panelInput.classList.add('focused'));
    sourceInput.addEventListener("blur", () => panelInput.classList.remove('focused'));
    swapBtn.addEventListener("click", handleSwap);
    copyBtn.addEventListener("click", () => copyToClipboard(outputDiv.textContent, copyBtn));
    randomBtn.addEventListener("click", handleRandomGenerate);

    sourceModeTabs.addEventListener("click", (e) => {
        if (e.target.matches(".mode-tab")) {
            state.sourceMode = e.target.dataset.mode;
            state.targetMode = state.sourceMode === 'number' ? 'sqid' : 'number';
            updateUI();
            handleConversion(true);
        }
    });

    // --- Utility Functions ---
    function debounce(func, wait) {
        let timeout;
        const debounced = function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
        debounced.cancel = function() {
            clearTimeout(timeout);
        };
        return debounced;
    }

    // --- Core Functions ---
    const runConversion = (inputText) => {
        const cacheKey = `${state.sourceMode}:${inputText}`;
        if (conversionCache.has(cacheKey)) {
            const cached = conversionCache.get(cacheKey);
            // ⚡ Bolt: Delete and re-set to update Map insertion order for LRU eviction
            conversionCache.delete(cacheKey);
            conversionCache.set(cacheKey, cached);
            applyConversionResult(cached.result, cached.error);
            return;
        }

        let result;
        let error = null;

        if (state.sourceMode === 'number') {
            if (!/^\d+(\s*,\s*\d+)*$/.test(inputText)) {
                error = "Input must be valid non-negative numbers separated by commas.";
            } else {
                result = encodeSqid(inputText);
                if (typeof result === 'string' && result.startsWith("Error:")) {
                    error = result;
                }
            }
        } else { // sourceMode is 'sqid'
            result = decodeSqid(inputText);
            if (!result || (typeof result === 'string' && result.startsWith("Error:"))) {
                error = "Not a valid Sqid. Check for invalid characters or length.";
            }
        }

        // Limit cache size to prevent memory leak
        if (conversionCache.size > 1000) {
            const firstKey = conversionCache.keys().next().value;
            conversionCache.delete(firstKey);
        }
        conversionCache.set(cacheKey, { result, error });

        applyConversionResult(result, error);
    };

    const applyConversionResult = (result, error) => {
        if (error) {
            outputDiv.textContent = error;
            outputDiv.classList.add('error-box');
        } else {
            outputDiv.textContent = result;
            outputDiv.classList.remove('error-box');
        }
    };

    const debouncedRunConversion = debounce(runConversion, 250); // ⚡ Bolt: Debounce WASM execution to improve typing performance

    function handleConversion(immediate = false) {
        const inputText = sourceInput.value.trim();
        outputContainer.classList.toggle('input-has-text', inputText.length > 0);
        charCount.textContent = `${sourceInput.value.length} / 5000`;

        // ⚡ Bolt: Early return if normalized input and mode haven't changed to prevent redundant processing
        const currentKey = `${state.sourceMode}:${inputText}`;
        if (currentKey === lastProcessedKey && immediate !== true) {
            return;
        }
        lastProcessedKey = currentKey;

        // Clear output only when input is empty to avoid flickering
        if (!inputText) {
            outputDiv.innerHTML = '';
            outputDiv.className = 'text-area result-box'; // Reset class and keep result-box for styling
            debouncedRunConversion.cancel();
            return;
        }

        outputDiv.className = 'text-area result-box'; // Reset class and keep result-box for styling

        if (immediate === true) {
            debouncedRunConversion.cancel();
            runConversion(inputText);
        } else {
            debouncedRunConversion(inputText);
        }
    }

    function handleSwap() {
        const currentOutput = !outputDiv.classList.contains('error-box') ? outputDiv.textContent : '';
        [state.sourceMode, state.targetMode] = [state.targetMode, state.sourceMode];
        sourceInput.value = currentOutput;
        updateUI();
        handleConversion(true);
        sourceInput.focus();
    }

    function updateUI() {
        document.querySelectorAll('.mode-tab').forEach(tab => {
            const isSourceTab = tab.parentElement.id === 'source-mode-tabs';
            const isActive = isSourceTab ? tab.dataset.mode === state.sourceMode : tab.dataset.mode === state.targetMode;
            tab.classList.toggle('active', isActive);
        });

        sourceInput.placeholder = state.sourceMode === 'number' ? "Enter non-negative numbers to encode (e.g., 1, 2, 3)..." : "Enter a Sqid to decode...";
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

    function handleRandomGenerate() {
        try {
            const randomID = generateRandomID(); // from WASM
            if (!randomID || randomID.toString().startsWith("Error")) {
                throw new Error(randomID);
            }

            // Ensure we're in NUMBER → SQID mode
            state.sourceMode = 'number';
            state.targetMode = 'sqid';

            sourceInput.value = randomID.toString();
            updateUI();
            handleConversion(true);
            sourceInput.focus();

        } catch (err) {
            outputDiv.textContent = "Failed to generate random ID.";
            outputDiv.classList.add('error-box');
            console.error(err);
        }
    }

    // --- Initial UI Setup on Load ---
    updateUI();

}).catch((err) => {
    console.error("Failed to initialize the application:", err);
    document.body.innerHTML = `<p style="color: red; text-align: center; padding: 50px;"><strong>Error:</strong> Application could not start. Please check the console.</p>`;
});
