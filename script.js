// --- 1. Start WebAssembly loading immediately ---
const go = new Go();
// no-cache = revalidate each load (cheap 304), so a rebuilt binary is never shadowed by a stale cached copy
const wasmPromise = WebAssembly.instantiateStreaming(fetch("sqids.wasm", {cache: "no-cache"}), go.importObject);

// --- Theme toggle (independent of WASM, so it works even if loading fails) ---
// The initial theme is set by the inline script in <head> to avoid a flash.
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
}

applyTheme(document.documentElement.dataset.theme);

themeToggle.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked: choice lasts this visit */ }
});

// Follow system theme changes until the user picks one
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) { /* storage blocked */ }
    if (!saved) applyTheme(e.matches ? "dark" : "light");
});

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
    const copyStatus = document.getElementById("copyStatus");
    const copyTooltip = copyBtn.querySelector(".copy-tooltip");

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
            applyConversionResult(cached.result, cached.error);
            return;
        }

        // WASM validates each line and reports failures as "Error: line N: ..." strings
        const result = state.sourceMode === 'number' ? encodeSqid(inputText) : decodeSqid(inputText);
        let error = null;
        if (typeof result !== 'string' || result.startsWith("Error:")) {
            const msg = String(result).replace(/^Error:\s*/, '');
            error = msg.charAt(0).toUpperCase() + msg.slice(1);
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
            const isActive = tab.dataset.mode === state.sourceMode;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-pressed', String(isActive));
        });

        document.getElementById('input-label').textContent = state.sourceMode === 'number' ? 'Numbers' : 'Sqids';
        document.getElementById('output-label').textContent = state.sourceMode === 'number' ? 'Sqids' : 'Numbers';
        sourceInput.placeholder = state.sourceMode === 'number' ? "e.g. 1, 2, 3\n127" : "e.g. 86Rf07\nEwF";
    }

    function copyToClipboard(text, button) {
        if (!text || outputDiv.classList.contains('error-box')) return;
        navigator.clipboard.writeText(text).then(() => {
            button.classList.add("copied");
            copyStatus.textContent = "Copied to clipboard";
            setTimeout(() => {
                button.classList.remove("copied");
                copyStatus.textContent = "";
            }, 2000);
        }).catch(err => {
            // Clipboard can be blocked (permissions, insecure context): select the text so the user can copy it manually
            const range = document.createRange();
            range.selectNodeContents(outputDiv);
            getSelection().removeAllRanges();
            getSelection().addRange(range);
            copyStatus.textContent = "Copy blocked. Result selected, press Ctrl+C or ⌘C.";
            copyTooltip.textContent = "Press Ctrl+C / ⌘C";
            button.classList.add("copied");
            setTimeout(() => {
                button.classList.remove("copied");
                copyTooltip.textContent = "Copied!";
                copyStatus.textContent = "";
            }, 3000);
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
    // Keep the page content (and SEO text) intact; only report the failure in the output panel.
    const output = document.getElementById("output");
    output.textContent = "This tool could not start. Your browser may not support WebAssembly.";
    output.classList.add("error-box");
    document.getElementById("output-container").classList.add("input-has-text");
});
