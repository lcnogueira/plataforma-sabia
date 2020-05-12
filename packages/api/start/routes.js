/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Route = use('Route');

Route.post('/auth/register', 'AuthController.register').validator('User');
Route.post('/auth/login', 'AuthController.auth')
	.validator('Session')
	.middleware(['recaptcha']);
Route.get('/auth/forgot-password', 'AuthController.forgotPassword')
	.validator('ForgotPassword')
	.middleware(['recaptcha']);
Route.post('/auth/reset-password', 'AuthController.resetPassword')
	.validator('ResetPassword')
	.middleware(['recaptcha']);

Route.resource('roles', 'RoleController')
	.validator(
		new Map([
			[['roles.store'], ['StoreRole']],
			[['roles.update'], ['UpdateRole']],
		]),
	)
	.apiOnly()
	.middleware('auth');

Route.resource('permissions', 'PermissionController')
	.validator(
		new Map([
			[['permissions.store'], ['StorePermission']],
			[['permissions.update'], ['UpdatePermission']],
		]),
	)
	.apiOnly()
	.middleware('auth');

Route.get('technologies', 'TechnologyController.index');
Route.post('technologies', 'TechnologyController.store');
Route.get('technologies/:id', 'TechnologyController.show');
Route.put('technologies/:id', 'TechnologyController.update');
Route.delete('technologies/:id', 'TechnologyController.destroy');

Route.get('/user/me', 'AuthController.getMe').middleware(['auth']);
Route.get('/', 'AppController.index').middleware(['auth']);
