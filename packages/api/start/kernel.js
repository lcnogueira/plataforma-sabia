/** @type {import('@adonisjs/framework/src/Server')} */
const Server = use('Server');

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on each http request only when the routes
| match.
|
*/
const globalMiddleware = [
	'App/Middleware/CollectPerformanceMetric',
	'Adonis/Middleware/BodyParser',
	'App/Middleware/ConvertEmptyStringsToNull',
	'App/Middleware/DecodeUriParams',
	'Adonis/Middleware/AuthInit',
	'App/Middleware/TranslateMiddleware',
];

/*
|--------------------------------------------------------------------------
| Named Middleware
|--------------------------------------------------------------------------
|
| Named middleware is key/value object to conditionally add middleware on
| specific routes or group of routes.
|
| // define
| {
|   auth: 'Adonis/Middleware/Auth'
| }
|
| // use
| Route.get().middleware('auth')
|
*/
const namedMiddleware = {
	auth: 'Adonis/Middleware/Auth',
	guest: 'Adonis/Middleware/AllowGuestOnly',
	role: 'App/Middleware/Role',
	permission: 'App/Middleware/Permission',
	handleParams: 'App/Middleware/HandleParam',
	uploadAuthorization: 'App/Middleware/UploadAuthorization',
	disclaimerMiddleware: 'App/Middleware/DisclaimerMiddleware',
	registrationCompleted: 'App/Middleware/RegistrationCompleted',
	published: 'App/Middleware/Published',
};

/*
|--------------------------------------------------------------------------
| Server Middleware
|--------------------------------------------------------------------------
|
| Server level middleware are executed even when route for a given URL is
| not registered. Features like `static assets` and `cors` needs better
| control over request lifecycle.
|
*/
const serverMiddleware = ['Adonis/Middleware/Static', 'Adonis/Middleware/Cors'];

Server.registerGlobal(globalMiddleware)
	.registerNamed(namedMiddleware)
	.use(serverMiddleware);
