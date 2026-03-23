import createBareServer from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';

const bare = createBareServer('/bare/');
const app = express();
const __dirname = process.cwd();

// Serve the frontend files from the 'public' folder
app.use(express.static(join(__dirname, 'public')));

app.use((req, res) => {
    res.status(404).sendFile(join(__dirname, 'public', '404.html'));
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