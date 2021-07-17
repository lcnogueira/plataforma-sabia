/* eslint-disable global-require */
const { ServiceProvider } = require('@adonisjs/fold');
const prometheus = require('prom-client');

class PrometheusProvider extends ServiceProvider {
	/**
	 * Register namespaces to the IoC container
	 *
	 * @function register
	 *
	 * @returns {void}
	 */
	register() {
		/**
		 * Configure Prometheus.
		 */
		this.app.singleton('Adonis/Prometheus', () => {
			const Config = this.app.use('Adonis/Src/Config');

			/**
			 * Configure system metircs collection.
			 */
			const systemMetrics = Config.get('prometheus.systemMetrics');

			if (systemMetrics.enabled) {
				const { enabled, ...params } = systemMetrics;
				prometheus.collectDefaultMetrics(params);
			}
			return prometheus;
		});

		/**
		 * Setup middlewares.
		 */
		this.app.bind('Adonis/Prometheus/Middlewares/CollectPerformanceMetric', () => {
			const CollectPerformanceMetric = require('../app/Middlewares/CollectPerformanceMetric');
			return new CollectPerformanceMetric();
		});
	}

	/**
	 * On boot add commands with ace.
	 *
	 * @returns {void}
	 */
	boot() {
		const customMetrics = require('../app/Utils/Prometheus/metrics');
		const Config = this.app.use('Adonis/Src/Config');

		/**
		 * Register alias.
		 */
		this.app.alias('Adonis/Prometheus', 'Prometheus');

		/**
		 * Expose metrics via API endpoint.
		 */
		if (Config.get('prometheus.exposeHttpEndpoint')) {
			const urlPath = Config.get('prometheus.endpoint', '/metrics');
			const router = this.app.use('Route');
			/**
			 * Create route.
			 */
			router.get(urlPath, ({ response }) => {
				prometheus.register.metrics().then((data) => {
					response.header('Content-type', prometheus.register.contentType).send(data);
				});
			});
		}

		/**
		 * Setup uptime metrics.
		 */
		const enableUptimeMetric = Config.get('prometheus.uptimeMetric.enabled');
		if (enableUptimeMetric) {
			customMetrics.uptimeMetric.inc(1);
		}
	}
}

module.exports = PrometheusProvider;
