const express = require('express');
const next = require('next');
const promBundle = require('express-prom-bundle');
const { collectDefaultMetrics } = require('prom-client');

const port = parseInt(process.env.PORT, 10) || 8000;
const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler();
const metricsMiddleware = promBundle({
	promClient: {
		collectDefaultMetrics,
	},
});

server.prepare().then(() => {
	const app = express();

	app.use(metricsMiddleware);

	app.all('*', (req, res) => {
		return handle(req, res);
	});

	app.listen(port, (err) => {
		if (err) {
			throw err;
		}

		// eslint-disable-next-line no-console
		console.log(`> Ready on http://localhost:${port}`);
	});
});
