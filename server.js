import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { createServer } from "http";
import express from "express";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const app = express();

app.use("/gp/", express.static(join(fileURLToPath(new URL(".", import.meta.url)), "./dist")));
app.use(express.static(join(fileURLToPath(new URL(".", import.meta.url)), "./public")));
app.use("/bare-mux/", express.static(baremuxPath));
app.use("/epoxy/", express.static(epoxyPath));

const server = createServer(app);

server.listen(3000, () => {
    console.log(`Listening on port 3000`);
});