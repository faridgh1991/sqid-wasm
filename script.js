// --- 1. Start WebAssembly loading immediately ---
// This allows the browser to fetch and compile the WASM file in parallel
// with parsing the HTML, which is much faster.
const go = new Go();
const wasmPromise = WebAssembly.instantiateStreaming(fetch("sqids.wasm"), go.importObject);

// --- 2. Create a promise that resolves when the DOM is ready ---
const domReadyPromise = new Promise(resolve => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
    } else {
        resolve();
    }
});

// --- 3. Use Promise.all to synchronize both operations ---
// The code inside .then() will only run after the WASM module is ready AND the DOM is ready.
Promise.all([wasmPromise, domReadyPromise]).then(([wasmResult]) => {
    // Run the WASM instance
    go.run(wasmResult.instance);
    console.log("WASM Module and DOM are both ready.");

    // --- All setup code that depends on WASM and the DOM goes here ---

    // DOM Element Selection
    const numberInput = document.getElementById("numberInput");
    const encodeBtn = document.getElementById("encodeBtn");
    const encodedSpan = document.getElementById("encoded");
    const copyEncodedBtn = document.getElementById("copyEncoded");
    const useEncodedBtn = document.getElementById("useEncodedBtn");

    const idInput = document.getElementById("idInput");
    const decodeBtn = document.getElementById("decodeBtn");
    const decodedSpan = document.getElementById("decoded");
    const copyDecodedBtn = document.getElementById("copyDecoded");
    const useDecodedBtn = document.getElementById("useDecodedBtn");

    // Event Listeners
    encodeBtn.addEventListener("click", handleEncode);
    numberInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleEncode();
    });

    decodeBtn.addEventListener("click", handleDecode);
    idInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleDecode();
    });

    useEncodedBtn.addEventListener("click", () => {
        const encodedValue = encodedSpan.textContent;
        if (encodedValue && encodedValue !== "(invalid)") {
            idInput.value = encodedValue;
            handleDecode();
        }
    });

    useDecodedBtn.addEventListener("click", () => {
        const decodedValue = decodedSpan.textContent;
        if (decodedValue && decodedValue !== "(invalid)") {
            numberInput.value = decodedValue;
            handleEncode();
        }
    });

    copyEncodedBtn.addEventListener("click", () => copyToClipboard(encodedSpan.textContent, copyEncodedBtn));
    copyDecodedBtn.addEventListener("click", () => copyToClipboard(decodedSpan.textContent, copyDecodedBtn));

    // Core Functions
    function handleEncode() {
        const numStr = numberInput.value;
        if (!numStr.trim()) {
            encodedSpan.textContent = "";
            return;
        }
        const id = encodeSqid(numStr);
        encodedSpan.textContent = id || "(invalid)";
    }

    function handleDecode() {
        const id = idInput.value;
        if (!id.trim()) {
            decodedSpan.textContent = "";
            return;
        }
        const num = decodeSqid(id);
        decodedSpan.textContent = num || "(invalid)";
    }

    function copyToClipboard(text, button) {
        if (!text || text === "(invalid)") {
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            button.classList.add("copied");
            setTimeout(() => {
                button.classList.remove("copied");
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    }

}).catch((err) => {
    // This will catch errors from either WASM loading or DOM readiness
    console.error("Failed to initialize the application:", err);
    // You could display a general error message to the user on the page
    document.body.innerHTML = `<p style="color: red; text-align: center; padding-top: 50px;"><strong>Error:</strong> Application could not start. Please check the console.</p>`;
});
