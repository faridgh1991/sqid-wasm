// Loaded at the end of <body>, so the DOM is already parsed when this runs.

// --- Start WebAssembly loading immediately ---
const go = new Go();
// no-cache = revalidate each load (cheap 304), so a rebuilt binary is never shadowed by a stale cached copy
const wasmPromise = WebAssembly.instantiateStreaming(fetch("sqids.wasm", {cache: "no-cache"}), go.importObject);

// --- Theme toggle (independent of WASM, so it works even if loading fails) ---
// The initial theme is set by the inline script in <head> to avoid a flash.
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    root.dataset.theme = theme;
    const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
}

function savedTheme() {
    try { return localStorage.getItem("theme"); } catch { return null; } // storage blocked
}

applyTheme(root.dataset.theme);

themeToggle.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    try { localStorage.setItem("theme", theme); } catch { /* storage blocked: choice lasts this visit */ }
});

// Follow system theme changes until the user picks one
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!savedTheme()) applyTheme(e.matches ? "dark" : "light");
});

// --- DOM elements ---
const sourceInput = document.getElementById("sourceInput");
const outputDiv = document.getElementById("output");
const outputContainer = document.getElementById("output-container");
const panelInput = document.getElementById("panel-input");
const modeTabs = document.querySelectorAll("#source-mode-tabs .mode-tab");
const inputLabel = document.getElementById("input-label");
const outputLabel = document.getElementById("output-label");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");
const copyTooltip = copyBtn.querySelector(".copy-tooltip");
const copyStatus = document.getElementById("copyStatus");
const charCount = document.getElementById("charCount");
const randomBtn = document.getElementById("randomBtn");

function showOutput(text, isError) {
    outputDiv.textContent = text;
    outputDiv.classList.toggle("error-box", isError);
    outputContainer.classList.toggle("input-has-text", text !== "");
}

// --- App (needs the WASM functions encodeSqid / decodeSqid / generateRandomID) ---
wasmPromise.then(({instance}) => {
    go.run(instance);

    let mode = "number"; // "number" = encode, "sqid" = decode

    // ⚡ Bolt: LRU cache of results to skip the synchronous WASM call for repeated inputs.
    // A Map keeps insertion order, so the first key is always the least recently used.
    const CACHE_LIMIT = 1000;
    const cache = new Map();
    // ⚡ Bolt: skip work when the trimmed input and mode haven't changed (e.g. trailing spaces)
    let lastKey = "";

    function convert(text) {
        const key = `${mode}:${text}`;
        let entry = cache.get(key);
        if (entry) {
            cache.delete(key); // re-insert below to mark as most recently used
        } else {
            // WASM validates each line and reports failures as "Error: line N: ..." strings
            const result = String(mode === "number" ? encodeSqid(text) : decodeSqid(text));
            const isError = result.startsWith("Error:");
            const msg = isError ? result.replace(/^Error:\s*/, "") : result;
            entry = {text: isError ? msg.charAt(0).toUpperCase() + msg.slice(1) : msg, isError};
            if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
        }
        cache.set(key, entry);
        showOutput(entry.text, entry.isError);
    }

    // ⚡ Bolt: debounce WASM calls while typing
    let debounceTimer;

    function update({immediate = false} = {}) {
        const text = sourceInput.value.trim();
        charCount.textContent = `${sourceInput.value.length} / ${sourceInput.maxLength}`;

        const key = `${mode}:${text}`;
        if (key === lastKey && !immediate) return;
        lastKey = key;
        clearTimeout(debounceTimer);

        if (!text) {
            showOutput("", false);
        } else if (immediate) {
            convert(text);
        } else {
            debounceTimer = setTimeout(convert, 250, text);
        }
    }

    function setMode(newMode) {
        mode = newMode;
        const encoding = mode === "number";
        modeTabs.forEach((tab) => {
            const active = tab.dataset.mode === mode;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-pressed", String(active));
        });
        inputLabel.textContent = encoding ? "Numbers" : "Sqids";
        outputLabel.textContent = encoding ? "Sqids" : "Numbers";
        sourceInput.placeholder = encoding ? "e.g. 1, 2, 3\n127" : "e.g. 86Rf07\nEwF";
    }

    // --- Copy, with feedback that never overlaps a previous click ---
    let copyTimer;

    function flashCopied(tooltip, status, ms) {
        clearTimeout(copyTimer);
        copyTooltip.textContent = tooltip;
        copyStatus.textContent = status;
        copyBtn.classList.add("copied");
        copyTimer = setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyTooltip.textContent = "Copied!";
            copyStatus.textContent = "";
        }, ms);
    }

    async function copyResult() {
        const text = outputDiv.textContent;
        if (!text || outputDiv.classList.contains("error-box")) return;
        try {
            await navigator.clipboard.writeText(text);
            flashCopied("Copied!", "Copied to clipboard", 2000);
        } catch (err) {
            // Clipboard can be blocked (permissions, insecure context): select the text so the user can copy it manually
            getSelection().selectAllChildren(outputDiv);
            flashCopied("Press Ctrl+C / ⌘C", "Copy blocked. Result selected, press Ctrl+C or ⌘C.", 3000);
            console.error("Failed to copy text:", err);
        }
    }

    // --- Events ---
    sourceInput.addEventListener("input", () => update());
    sourceInput.addEventListener("focus", () => panelInput.classList.add("focused"));
    sourceInput.addEventListener("blur", () => panelInput.classList.remove("focused"));

    modeTabs.forEach((tab) => tab.addEventListener("click", () => {
        setMode(tab.dataset.mode);
        update({immediate: true});
    }));

    swapBtn.addEventListener("click", () => {
        // Move a valid result into the input; otherwise keep what the user typed
        if (outputDiv.textContent && !outputDiv.classList.contains("error-box")) {
            sourceInput.value = outputDiv.textContent;
        }
        setMode(mode === "number" ? "sqid" : "number");
        update({immediate: true});
        sourceInput.focus();
    });

    copyBtn.addEventListener("click", copyResult);

    randomBtn.addEventListener("click", () => {
        const id = String(generateRandomID());
        if (id.startsWith("Error")) {
            showOutput("Failed to generate random ID.", true);
            console.error(id);
            return;
        }
        sourceInput.value = id;
        setMode("number");
        update({immediate: true});
        sourceInput.focus();
    });

    setMode(mode);
    update({immediate: true}); // convert anything the browser restored into the textarea
}).catch((err) => {
    console.error("Failed to initialize the application:", err);
    // Keep the page content (and SEO text) intact; only report the failure in the output panel.
    showOutput("This tool could not start. Your browser may not support WebAssembly.", true);
});
