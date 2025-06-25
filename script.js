const go = new Go();

WebAssembly.instantiateStreaming(fetch("sqids.wasm"), go.importObject).then((result) => {
    go.run(result.instance);

    document.getElementById("encodeBtn").addEventListener("click", () => {
        const num = document.getElementById("numberInput").value;
        const id = encodeSqid(num);
        document.getElementById("encoded").textContent = id || "(invalid)";
    });

    document.getElementById("decodeBtn").addEventListener("click", () => {
        const id = document.getElementById("idInput").value;
        const num = decodeSqid(id);
        document.getElementById("decoded").textContent = num || "(invalid)";
    });
}).catch((err) => {
    console.error("Error loading WASM module:", err);
});
