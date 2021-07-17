/** @type {typeof import('prom-client')} */
const prometheus = use('Adonis/Prometheus');
const Config = use('Adonis/Src/Config');

module.exports = {
	/**
	 * Total time each HTTP request takes.
	 */
	httpMetric: new prometheus.Histogram(Config.get('prometheus.httpMetric')),

	/**
	 * Uptime performance of the application.
	 */
	uptimeMetric: new prometheus.Gauge(Config.get('prometheus.uptimeMetric')),

	/**
	 * No. of request handled.
	 */
	throughputMetric: new prometheus.Counter(Config.get('prometheus.throughputMetric')),
};
