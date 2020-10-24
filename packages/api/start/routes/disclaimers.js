/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable jsdoc/check-indentation */

const { getMiddlewareRoles, roles } = require('../../app/Utils/roles_capabilities');

const Route = use('Route');

/** Disclaimer Routes */
/**
 * @api {post} /disclaimers Creates a new Disclaimer
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {String} description Mandatory Disclaimer Description.
 * @apiParam {Boolean} required Disclaimer is required
 * @apiParam {String="privacypolicy", "termsOfUseRegister", "termsOfUseTechnology"} type Disclaimer Type
 * @apiParam {String} version Mandatory Disclaimer Version.
 * @apiParamExample  {json} Request sample:
 * {
 *   "description": "Declaro ciência dos Termos e Condições de Uso.",
 *	 "required": true,
 *	 "type": "termsOfUseRegister",
 *	 "version": "1"
 *  }
 * @apiSuccess {Number} id Disclaimer ID
 * @apiSuccess {Date} created_at Disclaimer Register date
 * @apiSuccess {Date} updated_at Disclaimer Update date
 * @apiSuccess {String} description Disclaimer Description
 * @apiSuccess {Boolean} required Disclaimer is required
 * @apiSuccess {String} type Disclaimer Type
 * @apiSuccess {String} version Disclaimer Version.
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 * 	"id": 10,
 * 	"created_at": "2020-10-21 11:42:14",
 * 	"updated_at": "2020-10-21 11:42:14",
 * 	"description": "Declaro ciência dos Termos e Condições de Uso.",
 * 	"required": true,
 * 	"type": "termsOfUseRegister",
 * 	"version": "1"
 *  }
 *@apiError (Bad Request 400) {Object} error Error object
 *@apiError (Bad Request 400) {String} error.error_code Error code
 *@apiError (Bad Request 400) {Object[]} error.message Error messages
 *@apiErrorExample {json} Validation Error: Disclaimer Required
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "VALIDATION_ERROR",
 *   			"message": [
 *     				{
 *       				"message": "type deve estar entre os valores (privacypolicy,termsOfUseRegister,termsOfUseTechnology).",
 *       				"field": "type",
 *       				"validation": "in"
 *     				}
 *   			]
 * 			}
 *		}
 *@apiErrorExample {json} Validation Error: Description Required
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "VALIDATION_ERROR",
 *   			"message": [
 *     				{
 *       				"message": "description é obrigatório e está faltando.",
 *       				"field": "description",
 *       				"validation": "required"
 *     				}
 *   			]
 * 			}
 *		}
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 */
Route.post('disclaimers', 'DisclaimerController.store')
	.middleware(['auth', getMiddlewareRoles([roles.ADMIN])])
	.validator('Disclaimer');

/**
 * @api {post} /disclaimers/accept Accept multiple disclaimers
 * @apiGroup Disclaimers
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {Number[]} [disclaimers] Mandatory Disclaimers ID array.
 * @apiParamExample  {json} Request sample:
 * {
 *   "disclaimers": [1,2,3,4]
 *  }
 * @apiSuccess {Number} id Disclaimer ID
 * @apiSuccess {Date} created_at Disclaimer Register date
 * @apiSuccess {Date} updated_at Disclaimer Update date
 * @apiSuccess {String} description Disclaimer Description
 * @apiSuccess {Boolean} required Disclaimer is required
 * @apiSuccess {String} type Disclaimer Type
 * @apiSuccess {String} version Disclaimer Version.
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * [
 *  {
 *    "id": 1,
 *    "created_at": "2020-10-23 12:04:31",
 *    "updated_at": "2020-10-23 12:04:31",
 *    "description": "Concordo com a Política de Privacidade e os Termos e Condições de Uso.",
 *    "required": 1,
 *    "type": "termsOfUseRegister",
 *    "version": "1",
 *    "pivot": {
 *    "disclaimer_id": 1,
 *    "user_id": 14
 *    }
 *  },
 *  {
 *   "id": 2,
 *   "created_at": "2020-10-23 12:04:31",
 *   "updated_at": "2020-10-23 12:04:31",
 *   "description": "Concordo com o processamento dos meus dados pessoais para fins de fornecimento dos serviços da Plataforma Sabiá. Veja mais na Política de Privacidade. ",
 *   "required": 1,
 *   "type": "termsOfUseRegister",
 *   "version": "1",
 *   "pivot": {
 *    "disclaimer_id": 2,
 *    "user_id": 14
 *   }
 *  },
 *  {
 *   "id": 3,
 *   "created_at": "2020-10-23 12:04:31",
 *   "updated_at": "2020-10-23 12:04:31",
 *   "description": "Concordo em respeitar a legislação brasileira vigente no conteúdo que eu venha a disponibilizar na Plataforma Sabiá, sendo de minha exclusiva responsabilidade. Veja mais nos Termos e Condições de Uso. ",
 *   "required": 1,
 *   "type": "termsOfUseRegister",
 *   "version": "1",
 *   "pivot": {
 *     "disclaimer_id": 3,
 *     "user_id": 14
 *    }
 *  },
 *  {
 *   "id": 4,
 *   "created_at": "2020-10-23 12:04:31",
 *   "updated_at": "2020-10-23 12:04:31",
 *   "description": "Estou ciente de que posso revogar o consentimento de uso dos meus dados pessoais a qualquer momento. Todavia, não poderei mais utilizar os serviços da plataforma que necessitam do uso e da coleta de dados pessoais. Veja mais na Política de Privacidade. ",
 *   "required": 1,
 *   "type": "termsOfUseRegister",
 *   "version": "1",
 *   "pivot": {
 *   "disclaimer_id": 4,
 *   "user_id": 14
 *    }
 *   }
 *  ]
 *@apiError (Bad Request 400) {Object} error Error object
 *@apiError (Bad Request 400) {String} error.error_code Error code
 *@apiError (Bad Request 400) {Object[]} error.message Error messages
 *@apiErrorExample {json} Validation Error: Disclaimer Required
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "VALIDATION_ERROR",
 *   			"message": [
 *     				{
 *       				"message": "type deve estar entre os valores (privacypolicy,termsOfUseRegister,termsOfUseTechnology).",
 *       				"field": "type",
 *       				"validation": "in"
 *     				}
 *   			]
 * 			}
 *		}
 *@apiErrorExample {json} Validation Error: Description Required
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "VALIDATION_ERROR",
 *   			"message": [
 *     				{
 *       				"message": "description é obrigatório e está faltando.",
 *       				"field": "description",
 *       				"validation": "required"
 *     				}
 *   			]
 * 			}
 *		}
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 */

Route.post('disclaimers/accept', 'DisclaimerController.accept').middleware(['auth']);

/**
 * @api {put} /disclaimers/:id Updates a Disclaimer
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {Number} id Mandatory Disclaimer ID.
 * @apiParam {String} description Optional Disclaimer Description.
 * @apiParam {Number[]} [permissions] Optional Permission ID array.
 * @apiParamExample  {json} Request sample:
 *    {
 *		"description": "Updated User Disclaimer Description"
 *    }
 * @apiSuccess {Number} id Disclaimer ID
 * @apiSuccess {String} role User Disclaimer
 * @apiSuccess {String} description Disclaimer Description
 * @apiSuccess {Date} created_at Disclaimer Register date
 * @apiSuccess {Date} updated_at Disclaimer Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *   "id": 8,
 *   "role": "USER_ROLE",
 *   "description": "Updated User Disclaimer Description",
 *   "created_at": "2020-08-01 15:14:07",
 *   "updated_at": "2020-08-01 17:21:08",
 * }
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 *@apiErrorExample {json} Resource Disclaimer was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource Disclaimer was not found"
 * 			}
 *		}
 */
Route.put('disclaimers/:id', 'DisclaimerController.update')
	.middleware(['auth', getMiddlewareRoles([roles.ADMIN])])
	.validator('Disclaimer');
/**
 * @api {delete} /disclaimers/:id Deletes a Disclaimer
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {Number} id Mandatory Disclaimer ID.
 * @apiParamExample  {json} Request sample:
 *	/disclaimers/1
 * @apiSuccess {Boolean} success Success Flag
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *		"success":"true"
 *    }
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 *@apiErrorExample {json} Resource Disclaimer was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource Disclaimer was not found"
 * 			}
 *		}
 */
Route.delete('disclaimers/:id', 'DisclaimerController.destroy').middleware([
	'auth',
	getMiddlewareRoles([roles.ADMIN]),
	'handleParams',
]);
/**
 * @api {delete} /disclaimers Delete multiple Disclaimers
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {String} ids List of disclaimers IDs.
 * @apiParamExample  {json} Request sample:
 *	/disclaimers?ids=1,2,3
 * @apiSuccess {Boolean} success Success Flag
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *		"success":"true"
 *    }
 * @apiUse AuthError
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 *@apiErrorExample {json} Validation Error: Ids Required
 *    HTTP/1.1 400 Bad Request
 *		{
 *    		"error": {
 *        		"error_code": "VALIDATION_ERROR",
 *        		"message": [
 *            		{
 *                		"message": "ids é obrigatório e está faltando.",
 *                		"field": "ids",
 *                		"validation": "required"
 *            		}
 *        		]
 *   		}
 *		}
 */
Route.delete('disclaimers/', 'DisclaimerController.destroyMany')
	.middleware(['auth', getMiddlewareRoles([roles.ADMIN]), 'handleParams'])
	.validator('Disclaimer');
/**
 * @api {get} /disclaimers Lists All Disclaimers
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiUse Params
 * @apiSuccess {Object[]} disclaimers Disclaimers Collection
 * @apiSuccess {Number} disclaimers.id Disclaimer ID
 * @apiSuccess {String} disclaimers.role User Disclaimer
 * @apiSuccess {String} disclaimers.description Disclaimer Description
 * @apiSuccess {Date} disclaimers.created_at Disclaimer Register date
 * @apiSuccess {Date} disclaimers.updated_at Disclaimer Update date
 * @apiSuccess {Object[]} disclaimers.permissions List of role permissions.
 * @apiSuccess {Number} disclaimers.permissions.id Permssion ID.
 * @apiSuccess {Object} disclaimers.permissions.pivot Disclaimer-Permssion relashionship.
 * @apiSuccess {Number} disclaimers.permissions.pivot.permission_id Permssion ID in pivot table.
 * @apiSuccess {Number} disclaimers.permissions.pivot.role_id Disclaimer ID in pivot table.
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * [
 * {
 *   "id": 8,
 *   "role": "USER_ROLE",
 *   "description": "User Disclaimer Description",
 *   "created_at": "2020-08-01 15:14:07",
 *   "updated_at": "2020-08-01 15:14:07",
 *   "permissions": [
 *     {
 *       "id": 1,
 *       "pivot": {
 *         "permission_id": 1,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 2,
 *       "pivot": {
 *         "permission_id": 2,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 3,
 *       "pivot": {
 *         "permission_id": 3,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 4,
 *       "pivot": {
 *         "permission_id": 4,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 5,
 *       "pivot": {
 *         "permission_id": 5,
 *         "role_id": 8
 *       }
 *     }
 *   ]
 * }
 * ]
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 */
Route.get('disclaimers', 'DisclaimerController.index').middleware(['handleParams']);
/**
 * @api {get} /disclaimers/:id Gets a single Disclaimer
 * @apiGroup Disclaimers
 * @apiPermission ADMIN
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParam {Number} id Mandatory Disclaimer ID.
 * @apiParam embed Activate Embedding.
 * @apiParamExample  {json} Request sample:
 *	/disclaimers/8?embed
 * @apiSuccess {Number} id Disclaimer ID
 * @apiSuccess {String} role User Disclaimer
 * @apiSuccess {String} description Disclaimer Description
 * @apiSuccess {Date} created_at Disclaimer Register date
 * @apiSuccess {Date} updated_at Disclaimer Update date
 * @apiSuccess {Object[]} permissions List of role permissions.
 * @apiSuccess {Number} permissions.id Permssion ID.
 * @apiSuccess {Object} permissions.pivot Disclaimer-Permssion relashionship.
 * @apiSuccess {Number} permissions.pivot.permission_id Permssion ID in pivot table.
 * @apiSuccess {Number} permissions.pivot.role_id Disclaimer ID in pivot table.
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *   "id": 8,
 *   "role": "USER_ROLE",
 *   "description": "User Disclaimer Description",
 *   "created_at": "2020-08-01 15:14:07",
 *   "updated_at": "2020-08-01 15:14:07",
 *   "permissions": [
 *     {
 *       "id": 1,
 *       "pivot": {
 *         "permission_id": 1,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 2,
 *       "pivot": {
 *         "permission_id": 2,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 3,
 *       "pivot": {
 *         "permission_id": 3,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 4,
 *       "pivot": {
 *         "permission_id": 4,
 *         "role_id": 8
 *       }
 *     },
 *     {
 *       "id": 5,
 *       "pivot": {
 *         "permission_id": 5,
 *         "role_id": 8
 *       }
 *     }
 *   ]
 * }
 *@apiError (Forbidden 403) {Object} error Error object
 *@apiError (Forbidden 403) {String} error.error_code Error code
 *@apiError (Forbidden 403) {String} error.message Error message
 *@apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 *@apiError (Bad Request 400) {Object} error Error object
 *@apiError (Bad Request 400) {String} error.error_code Error code
 *@apiError (Bad Request 400) {String} error.message Error message
 *@apiErrorExample {json} Resource Disclaimer was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource Disclaimer was not found"
 * 			}
 *		}
 */
Route.get('disclaimers/:id', 'DisclaimerController.show').middleware(['handleParams']);
