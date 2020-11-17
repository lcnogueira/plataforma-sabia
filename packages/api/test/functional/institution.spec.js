const { test, trait } = use('Test/Suite')('Institution');

const Institution = use('App/Models/Institution');
const Factory = use('Factory');
const { antl, errors, errorPayload } = require('../../app/Utils');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

test('GET /institutions returns all institutions', async ({ client }) => {
	const user = await await Factory.model('App/Models/User').create();
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client
		.get('/institutions')
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset([institution.toJSON()]);
});

test('GET /institutions/:id returns a institution', async ({ client }) => {
	const user = await await Factory.model('App/Models/User').create();
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client
		.get(`/institutions/${institution.id}`)
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset(institution.toJSON());
});

test('POST /institutions creates a new institution', async ({ client, assert }) => {
	const user = await await Factory.model('App/Models/User').create();
	const institutionFactory = await Factory.model('App/Models/Institution').make({
		user_id: null,
	});

	const response = await client
		.post('/institutions')
		.loginVia(user, 'jwt')
		.send(institutionFactory.toJSON())
		.end();

	const institutionCreated = await Institution.query()
		.select('name', 'user_id')
		.where({ id: response.body.institution.id })
		.first();

	response.assertStatus(201);
	assert.equal(institutionCreated.user_id, user.id);
	assert.equal(institutionCreated.name, institutionFactory.name);
});

test('PUT /institutions/:id updates an institution', async ({ client, assert }) => {
	const user = await await Factory.model('App/Models/User').create();
	const originalInstitution = await Factory.model('App/Models/Institution').create();

	const modifiedInstitution = {
		...originalInstitution.toJSON(),
		name: 'any name',
	};

	const response = await client
		.put(`/institutions/${originalInstitution.id}`)
		.loginVia(user, 'jwt')
		.send(modifiedInstitution)
		.end();

	const updatedInstitution = await Institution.query()
		.select('name')
		.where({ id: originalInstitution.id })
		.first();

	response.assertStatus(204);
	assert.equal(updatedInstitution.name, modifiedInstitution.name);
});

test('PUT /institutions/:id cannot update an institution with an already existing CNPJ', async ({
	client,
}) => {
	const user = await await Factory.model('App/Models/User').create();
	const [alreadyExistentInstitution, anyInstitution] = await Factory.model(
		'App/Models/Institution',
	).createMany(2);

	const response = await client
		.put(`/institutions/${anyInstitution.id}`)
		.loginVia(user, 'jwt')
		.send({
			...anyInstitution.toJSON(),
			cnpj: alreadyExistentInstitution.cnpj,
		})
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload('VALIDATION_ERROR', [
			{
				field: 'cnpj',
				validation: 'unique',
			},
		]),
	);
});

test('DELETE /institutions/:id delete an institution', async ({ client, assert }) => {
	const user = await await Factory.model('App/Models/User').create();
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client
		.delete(`/institutions/${institution.id}`)
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(204);

	const institutionFromDatabase = await Institution.query()
		.where({ id: institution.id })
		.first();

	assert.isNull(institutionFromDatabase);
});

test('DELETE /institutions/:id not delete when it fails', async ({ client }) => {
	const user = await await Factory.model('App/Models/User').create();
	const nonexistentInstitutionId = 999;

	const response = await client
		.delete(`/institutions/${nonexistentInstitutionId}`)
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(errors.RESOURCE_DELETED_ERROR, antl('error.resource.resourceDeletedError')),
	);
});
