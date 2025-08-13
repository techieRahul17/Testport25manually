import express from "express";
import net from "net";

const app = express();
const PORT = process.env.PORT || 3000;

function checkTcp({ host = "alt1.gmail-smtp-in.l.google.com", port = 25, timeoutMs = 7000 }) {
    return new Promise((resolve) => {
        const start = Date.now();
        const socket = net.createConnection({ host, port });
        let finished = false;

        const done = (ok, message) => {
            if (finished) return;
            finished = true;
            try { socket.destroy(); } catch {}
            resolve({ ok, message, ms: Date.now() - start });
        };

        socket.on("connect", () => done(true, "connected"));
        socket.on("error", (err) => done(false, err?.message || "error"));
        socket.setTimeout(timeoutMs, () => done(false, "timeout"));
    });
}

app.get("/", (_req, res) => res.send("Use /check?host=<fqdn>&port=<num>. Default tests Gmail MX on 25."));
app.get("/check", async (req, res) => {
    const host = req.query.host || "alt1.gmail-smtp-in.l.google.com";
    const port = Number(req.query.port || 25);
    const result = await checkTcp({ host, port });
    res.json({ host, port, ...result });
});

app.listen(PORT, () => console.log(`HTTP up on ${PORT}`));
