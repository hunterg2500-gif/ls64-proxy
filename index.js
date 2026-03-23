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
        .search-form {
            display: flex;
            gap: 8px;
            margin-top: 28px;
            width: 90%;
            max-width: 480px;
        }
        .search-input {
            flex: 1;
            background: #111;
            border: 1px solid #1a3320;
            border-radius: 8px;
            color: #00ff66;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            padding: 10px 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: #333; }
        .search-input:focus {
            border-color: #00ff66;
            box-shadow: 0 0 12px rgba(0, 255, 102, 0.15);
        }
        .search-btn {
            background: #00ff66;
            border: none;
            border-radius: 8px;
            color: #050505;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            font-weight: bold;
            letter-spacing: 1px;
            padding: 10px 18px;
            transition: background 0.2s, box-shadow 0.2s;
        }
        .search-btn:hover {
            background: #00cc52;
            box-shadow: 0 0 16px rgba(0, 255, 102, 0.3);
        }
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
    <form class="search-form" id="searchForm">
        <input
            class="search-input"
            id="searchInput"
            type="text"
            placeholder="Search the web or enter a URL..."
            autocomplete="off"
            spellcheck="false"
        />
        <button class="search-btn" type="submit">GO</button>
    </form>
    <p class="footer">LS64 PROXY &mdash; BARE SERVER NODE</p>
    <script>
        (function () {
            var BARE = '/bare/';
            var UV_PREFIX = '/uv/service/';

            // XOR encode matching uv.config.js
            function xorEncode(str) {
                var encoded = '';
                for (var i = 0; i < str.length; i++) {
                    encoded += String.fromCharCode(str.charCodeAt(i) ^ 2);
                }
                return btoa(encoded);
            }

            function toProxyUrl(raw) {
                var url = raw.trim();
                // If it looks like a bare URL (no spaces, has a dot or starts with http)
                var isUrl = /^https?:\\/\\//.test(url) ||
                    (/^[^\\s]+\\.[^\\s]+/.test(url) && !/\\s/.test(url));
                if (isUrl) {
                    if (!/^https?:\\/\\//.test(url)) url = 'https://' + url;
                } else {
                    url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
                }
                return UV_PREFIX + xorEncode(url);
            }

            // Register service worker so UV can intercept proxied requests
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (e) {
                    console.warn('SW registration failed:', e);
                });
            }

            document.getElementById('searchForm').addEventListener('submit', function (e) {
                e.preventDefault();
                var query = document.getElementById('searchInput').value;
                if (!query.trim()) return;
                window.location.href = toProxyUrl(query);
            });
        })();
    </script>
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
