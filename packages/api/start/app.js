/* eslint-disable no-console */
/* eslint-disable func-names */
const path = require('path');
/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
	'@adonisjs/framework/providers/AppProvider',
	'@adonisjs/framework/providers/ViewProvider',
	'@adonisjs/auth/providers/AuthProvider',
	'@adonisjs/bodyparser/providers/BodyParserProvider',
	'@adonisjs/cors/providers/CorsProvider',
	'@adonisjs/lucid/providers/LucidProvider',
	'@adonisjs/validator/providers/ValidatorProvider',
	'@adonisjs/antl/providers/AntlProvider',
	'@adonisjs/cors/providers/CorsProvider',
	'@adonisjs/mail/providers/MailProvider',
	'@adonisjs/redis/providers/RedisProvider',
	'@rocketseat/adonis-bull/providers/Bull',
	'adonis-sentry/providers/Sentry',
	'@adonisjs/drive/providers/DriveProvider',
	path.join(__dirname, '..', 'providers', 'AlgoliaProvider'),
	path.join(__dirname, '..', 'providers', 'RequestProvider'),
	path.join(__dirname, '..', 'providers', 'GoogleProvider'),
];

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
	'@adonisjs/lucid/providers/MigrationsProvider',
	'@adonisjs/vow/providers/VowProvider',
	'@rocketseat/adonis-bull/providers/Command',
];

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {};

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = ['App/Commands/AlgoliaIndex', 'App/Commands/TestSlackWebhook'];

/*
|--------------------------------------------------------------------------
| Workaround
|--------------------------------------------------------------------------
|
| Upgrading Lucid to v6.2.1 should fix this but life is not so easy.
|
*/
console.log = function(msg, ...options) {
	const ignore = '.returning() is not supported by mysql and will not have any effect.';
	if (!!msg && String(msg).indexOf(ignore) === -1) {
		console.info(msg, ...options);
	}
};

module.exports = { providers, aceProviders, aliases, commands };
