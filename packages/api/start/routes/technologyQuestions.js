/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable jsdoc/check-indentation */

const { getMiddlewarePermissions, permissions } = require('../../app/Utils/roles_capabilities');

const Route = use('Route');

/**
 * @api {get} /questions Gets the questions of the logged in user
 * @apiGroup Technology Questions
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiUse Params
 * @apiParamExample  {json} Request sample:
 *	/questions
 * @apiSuccess {Object[]} questions User Technology Questions
 * @apiSuccess {Number} questions.id Question ID.
 * @apiSuccess {Number} questions.technology_id Technology ID.
 * @apiSuccess {Number} questions.user_id Buyer User ID.
 * @apiSuccess {String} questions.question Technology question.
 * @apiSuccess {String} questions.answer Technology question answer.
 * @apiSuccess {String} questions.status Technology Question Status.
 * @apiSuccess {Date} questions.created_at Order Register date
 * @apiSuccess {Date} questions.updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * [
 *	{
 *	   "id": 24,
 *	   "user_id": 1,
 *	   "technology_id": 1,
 *	   "question": "Rejib gucta jutucu limzurrip padpocre.",
 *	   "answer": "Ga nukuso ovulova fem keibe pivobe co kiopi esi eke badeofi wemsadwo ducvamah tugi pul vebho ujakad.",
 *	   "status": "unanswered",
 *	   "created_at": "2020-11-25 18:15:40",
 *	   "updated_at": "2020-11-25 18:15:40"
 *	}
 * ]
 * @apiUse AuthError
 */
Route.get('questions', 'TechnologyQuestionController.index').middleware(['auth', 'handleParams']);
/**
 * @api {get} /questions/:id Shows a public question
 * @apiGroup Technology Questions
 * @apiParamExample  {json} Request sample:
 *	/questions/33
 * @apiParam (Route Param) {Number} id Mandatory Technology Question ID
 * @apiUse Params
 * @apiSuccess {Number} id Question ID.
 * @apiSuccess {Number} technology_id Technology ID.
 * @apiSuccess {Number} user_id Buyer User ID.
 * @apiSuccess {String} question Technology question.
 * @apiSuccess {String} answer Technology question answer.
 * @apiSuccess {String} status Technology Question Status.
 * @apiSuccess {Date} created_at Order Register date
 * @apiSuccess {Date} updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *  "id": 33,
 *  "user_id": 15,
 *  "technology_id": 8,
 *  "question": "Osvageb ivi potcajum suhhom barsozin.",
 *  "answer": "A resposta é a seguinte: Damos suporte sim.",
 *  "status": "answered",
 *  "created_at": "2020-11-25 19:42:23",
 *  "updated_at": "2020-11-25 21:40:34"
 * }
 * @apiErrorExample {json} Resource TechnologyQuestion was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource TechnologyQuestion was not found"
 * 			}
 *		}
 */
Route.get('questions/:id', 'TechnologyQuestionController.show').middleware(['handleParams']);
/**
 * @api {get} technologies/:id/questions Gets technology questions
 * @apiGroup Technology Questions
 * @apiUse Params
 * @apiParam (Route Param) {Number} id Mandatory Technology ID
 * @apiParamExample  {json} Request sample:
 *	/technologies/11/questions
 * @apiSuccess {Object[]} questions User Technology Questions
 * @apiSuccess {Number} questions.id Question ID.
 * @apiSuccess {Number} questions.technology_id Technology ID.
 * @apiSuccess {Number} questions.user_id Buyer User ID.
 * @apiSuccess {String} questions.question Technology question.
 * @apiSuccess {String} questions.answer Technology question answer.
 * @apiSuccess {String} questions.status Technology Question Status.
 * @apiSuccess {Date} questions.created_at Order Register date
 * @apiSuccess {Date} questions.updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * 	[
 * 		{
 * 		   "id": 8,
 * 		   "user_id": 13,
 * 		   "technology_id": 11,
 * 		   "question": "Itajetu nojwu fuirzik nofba put.",
 * 		   "answer": "Febsaked tuc capdiis ligzimguc rekwafet adoritoc hedsicuw taru lak cadha fanwutoc sol adu adwib rusles fuwvi.",
 * 		   "status": "answered",
 * 		   "created_at": "2020-11-25 18:15:40",
 * 		   "updated_at": "2020-11-25 18:15:40"
 * 		 },
 * 		 {
 * 		   "id": 48,
 * 		   "user_id": 16,
 * 		   "technology_id": 11,
 * 		   "question": "Aduac ha wuk mepgentu ajezan.",
 * 		   "answer": "Reh gu weksi riz ke wiaso pe podavma novkurud bomopi jer benvehdu we.",
 * 		   "status": "answered",
 * 		   "created_at": "2020-11-25 19:42:23",
 * 		   "updated_at": "2020-11-25 19:42:23"
 * 		 },
 * 		 {
 * 		   "id": 49,
 * 		   "user_id": 19,
 * 		   "technology_id": 11,
 * 		   "question": "Walhu ise fu nawomu igusu.",
 * 		   "answer": "Taros wov siveh avinogese ab icule jenmafdav ewri esepigif vilidizu nu tuder care.",
 * 		   "status": "answered",
 * 		   "created_at": "2020-11-25 19:42:23",
 * 		   "updated_at": "2020-11-25 19:42:23"
 * 		 }
 * 	]
 * @apiErrorExample {json} Resource Technology was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource Technology was not found"
 * 			}
 * 		}
 */
Route.get(
	'technologies/:id/questions',
	'TechnologyQuestionController.showTechnologyQuestions',
).middleware(['handleParams']);
/**
 * @api {post} technologies/:id/questions Makes a technology question
 * @apiGroup Technology Questions
 * @apiParam {String} question Mandatory Question
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParamExample  {json} Request sample:
 *	/technology/1/questions
 * @apiSuccess {Number} id Question ID.
 * @apiSuccess {Number} technology_id Technology ID.
 * @apiSuccess {Number} user_id Buyer User ID.
 * @apiSuccess {String} question Technology question.
 * @apiSuccess {String="unanswered"} status Technology Question Status.
 * @apiSuccess {Date} created_at Order Register date
 * @apiSuccess {Date} updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *  "question": "Vocês dão suporte a implantação?",
 *  "status": "unanswered",
 *  "created_at": "2020-11-23 19:49:33",
 *  "updated_at": "2020-11-23 19:49:33",
 *  "id": 3,
 *  "technology_id": 1,
 *  "user_id": 18
 *	}
 * @apiUse AuthError
 */
Route.post('/questions', 'TechnologyQuestionController.store')
	.middleware(['auth'])
	.validator('MakeQuestion');

/**
 * @api {put} questions/:id/answer Answers a question
 * @apiGroup Technology Questions
 * @apiPermission ANSWER_TECHNOLOGY_QUESTION
 * @apiParam (Route Param) {Number} id Mandatory Technology Question ID
 * @apiParam {String} answer Mandatory Answer
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParamExample  {json} Request sample:
 *	questions/33/answer
 * @apiSuccess {Number} id Question ID.
 * @apiSuccess {Number} technology_id Technology ID.
 * @apiSuccess {Number} user_id Buyer User ID.
 * @apiSuccess {String} question Technology question.
 * @apiSuccess {String="answered"} status Technology Question Status.
 * @apiSuccess {Date} created_at Order Register date
 * @apiSuccess {Date} updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *  "id": 33,
 *  "user_id": 15,
 *  "technology_id": 8,
 *  "question": "Osvageb ivi potcajum suhhom barsozin.",
 *  "answer": "A resposta é a seguinte: Damos suporte sim.",
 *  "status": "answered",
 *  "created_at": "2020-11-25 19:42:23",
 *  "updated_at": "2020-11-25 21:40:34"
 * }
 * @apiUse AuthError
 * @apiError (Forbidden 403) {Object} error Error object
 * @apiError (Forbidden 403) {String} error.error_code Error code
 * @apiError (Forbidden 403) {String} error.message Error message
 * @apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 * @apiErrorExample {json} Resource TechnologyQuestion was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource TechnologyQuestion was not found"
 * 			}
 *		}
 */
Route.put('questions/:id/answer', 'TechnologyQuestionController.update')
	.middleware(['auth', getMiddlewarePermissions([permissions.ANSWER_TECHNOLOGY_QUESTION])])
	.validator('AnswerQuestion');
/**
 * @api {put} questions/:id/disable Disables a question
 * @apiGroup Technology Questions
 * @apiPermission DISABLE_TECHNOLOGY_QUESTION
 * @apiParam (Route Param) {Number} id Mandatory Technology Question ID
 * @apiHeader {String} Authorization Authorization Bearer Token.
 * @apiHeaderExample {json} Header-Example:
 *    {
 *      "Authorization": "Bearer <token>"
 *    }
 * @apiParamExample  {json} Request sample:
 *	/questions/24/disable
 * @apiSuccess {Number} id Question ID.
 * @apiSuccess {Number} technology_id Technology ID.
 * @apiSuccess {Number} user_id Buyer User ID.
 * @apiSuccess {String} question Technology question.
 * @apiSuccess {String="disabled"} status Technology Question Status.
 * @apiSuccess {Date} created_at Order Register date
 * @apiSuccess {Date} updated_at Order Update date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *  "id": 24,
 *  "user_id": 1,
 *  "technology_id": 1,
 *  "question": "Rejib gucta jutucu limzurrip padpocre.",
 *  "answer": "Ga nukuso ovulova fem keibe pivobe co kiopi esi eke badeofi wemsadwo ducvamah tugi pul vebho ujakad.",
 *  "status": "disabled",
 *  "created_at": "2020-11-25 18:15:40",
 *  "updated_at": "2020-11-28 15:06:31"
 * }
 * @apiUse AuthError
 * @apiError (Forbidden 403) {Object} error Error object
 * @apiError (Forbidden 403) {String} error.error_code Error code
 * @apiError (Forbidden 403) {String} error.message Error message
 * @apiErrorExample {json} Unauthorized Access
 *    HTTP/1.1 403 Forbidden
 *		{
 * 			"error": {
 *   			"error_code": "UNAUTHORIZED_ACCESS",
 *   			"message":"Você não tem permissão para acessar esse recurso"
 * 			}
 *		}
 * @apiErrorExample {json} Resource TechnologyQuestion was not found
 *    HTTP/1.1 400 Bad Request
 *		{
 * 			"error": {
 *   			"error_code": "RESOURCE_NOT_FOUND",
 *   			"message":"The resource TechnologyQuestion was not found"
 * 			}
 *		}
 */
Route.put('questions/:id/disable', 'TechnologyQuestionController.destroy').middleware([
	'auth',
	getMiddlewarePermissions([permissions.DISABLE_TECHNOLOGY_QUESTION]),
]);
