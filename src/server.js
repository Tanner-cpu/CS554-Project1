const express = require('express');
const net = require('net');
const os = require('os');
const app = express();

const port = Number(process.env.PORT || 3000);
const serviceName = process.env.SERVICE_NAME || 'cs454-project1';
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = Number(process.env.REDIS_PORT || 6379);

app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
        const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        console.log(
            `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs.toFixed(1)}ms`
        );
    });

    next();
});

app.get('/', (req, res) => {
    const body = {
        service: serviceName,
        hostname: os.hostname(),
        pid: process.pid,
        path: req.url,
        timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body, null, 2));
});

function redisCommand(command) {
    return new Promise((resolve, reject) => {
        console.log("Connecting to " + redisHost + ":" + redisPort);
        const socket = net.createConnection({ host: redisHost, port: redisPort });
        let data = '';

        socket.setTimeout(1500);
        socket.on('connect', () => socket.write(command + '\r\n'));
        socket.on('data', chunk => {
            data += chunk.toString();
            // Redis keeps the connection open for more commands, so there is no
            // 'end' event to wait for. One command means one reply line: as soon as
            // we see its CRLF terminator we have the whole answer and can hang up.
            if (data.includes('\r\n')) {
                socket.end();
                resolve(data.trim());
            }
        });
        socket.on('timeout', () => socket.destroy(new Error('Redis timeout')));
        socket.on('error', reject);
    });
}

async function redisIncr(key) {
    const reply = await redisCommand(`INCR ${key}`);
    const match = reply.match(/^:(\d+)/);
    if (!match) {
        throw new Error(`Unexpected Redis reply: ${reply}`);
    }
    return Number(match[1]);
}

app.get('/convert', async (req, res) => {
    const { lbs } = req.query;

    if (lbs === undefined || lbs === null || lbs === '') {
        return res.status(400).json({ error: 'Missing Parameter' });
    }

    const lbsNum = Number(lbs);
    if (isNaN(lbsNum)) {
        return res.status(400).json({ error: 'Parameter must be a number.' });
    }

    if (lbsNum < 0 || !Number.isFinite(lbsNum)) {
        return res.status(422).json({ error: 'Parameter must be a non-negative, finite number' });
    }

    try {

        const kg = Number((lbsNum * 0.45359237).toFixed(3));

        // 5. Increment the Redis key (assumes `redisClient` is connected globally)
        //await redisClient.incr('conversions');

        let redisCount = null;
        let redisError = null;
        try {
            redisCount = await redisIncr('conversions');
        } catch (error) {
            redisError = error.message;
            return res.status(500).json({ error: redisError });
        }

        // Return Results
        return res.status(200).json({
            lbs: lbsNum,
            kg: kg,
            formula: 'kg = lbs * 0.45359237'
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Conversion Redis Status 
app.get('/stats', async (req, res) => {
    try {
        const key = 'conversions';

        // SECURE: Fetch the value safely
        const conversions = await redisCommand('GET conversions');

        if (!conversions || conversions.includes('$-1')) {
            return res.status(200).json({ conversions: 0 });
        }
        const lines = conversions.trim().split('\r\n');
        const lastLine = lines[lines.length - 1];
        const totalConversions = parseInt(lastLine, 10);

        // 3. Return clean JSON
        return res.status(200).json({
            conversions: isNaN(totalConversions) ? 0 : totalConversions
        });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// Application Health Status Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// URL Not Found
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Application Server 
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`${serviceName} listening on port ${port}`);
});

// Server Shutdown 
const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down...`);

    server.close(async () => {
        console.log('Server closed.');

        try {
            // Send the raw Redis protocol disconnect command
            await redisCommand('QUIT');
            console.log('Redis client connection closed cleanly.');
        } catch (err) {
            console.error('Error closing Redis connection:', err);
        }
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));