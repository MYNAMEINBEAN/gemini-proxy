const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
const connection = new BareMux.BareMuxConnection('/bare-mux/worker.js');

const address = document.getElementById('addr');
const form = document.getElementById('form');
const frame = document.getElementById('webproxy');

connection.setTransport('/epoxy/index.mjs', [{ wisp: 'wss://wisp.mercurywork.shop/' }]);

document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        frame.src = `${location.origin}/gemini/${address.value}`;
    });
});