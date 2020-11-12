const errors = require('./errors');
const messages = require('./messages');
const localization = require('./localization');
const transaction = require('./transaction');
const roles_capabilities = require('./roles_capabilities');
const technology_distribution = require('./technology_distribution');
const statuses = require('./statuses');
const algolia = require('./algolia');

module.exports = {
	...errors,
	...messages,
	...localization,
	...transaction,
	...roles_capabilities,
	...technology_distribution,
	...statuses,
	...algolia,
};
