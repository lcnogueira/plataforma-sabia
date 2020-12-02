/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable jsdoc/check-indentation */

const { getMiddlewarePermissions, permissions } = require('../../app/Utils/roles_capabilities');

const Route = use('Route');

Route.get('ideas', 'IdeaController.index').middleware(['handleParams']);

Route.get('ideas/:id', 'IdeaController.show').middleware(['handleParams']);

Route.post('ideas', 'IdeaController.store')
	.middleware(['auth', 'registrationCompleted:acquire_technology'])
	.validator('StoreIdea');

Route.put('ideas/:id', 'IdeaController.update').middleware([
	'auth',
	getMiddlewarePermissions([permissions.UPDATE_IDEA]),
]);

Route.delete('ideas/:id', 'IdeaController.destroy').middleware([
	'auth',
	getMiddlewarePermissions([permissions.DELETE_IDEA]),
]);
