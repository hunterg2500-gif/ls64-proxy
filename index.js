import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';

const bare = createBareServer('/bare/');
const app = express();

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LS64 Proxy</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            background: #050505;
            color: #00ff66;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        h1 {
            font-size: 3rem;
            letter-spacing: 8px;
            margin: 0 0 8px;
            text-shadow: 0 0 20px rgba(0, 255, 102, 0.5);
        }
        .subtitle {
            color: #555;
            font-size: 0.85rem;
            letter-spacing: 3px;
            margin-bottom: 40px;
            text-transform: uppercase;
        }
        .card {
            background: #111;
            border: 1px solid #1a1a1a;
            border-radius: 12px;
            padding: 32px;
            width: 90%;
            max-width: 480px;
            box-shadow: 0 0 40px rgba(0, 255, 102, 0.07);
        }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #1a1a1a;
            font-size: 0.9rem;
        }
        .row:last-child { border-bottom: none; }
        .label { color: #444; }
        .value { color: #00ff66; }
        .value.ok { color: #00ff66; }
        .value.path { color: #888; }
        .footer {
            margin-top: 32px;
            color: #222;
            font-size: 0.7rem;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    <h1>LS64</h1>
    <p class="subtitle">Advanced Proxy</p>
    <div class="card">
        <div class="row">
            <span class="label">STATUS</span>
            <span class="value ok">ONLINE</span>
        </div>
        <div class="row">
            <span class="label">BARE SERVER</span>
            <span class="value path">/bare/</span>
        </div>
        <div class="row">
            <span class="label">VERSION</span>
            <span class="value path">1.0.0</span>
        </div>
    </div>
    <p class="footer">LS64 PROXY &mdash; BARE SERVER NODE</p>
</body>
</html>`);
});

app.use((req, res) => {
    res.status(404).send('Not found');
});

const server = createServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeWithVertex(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`LS64 Proxy is running on port ${PORT}`);
});
