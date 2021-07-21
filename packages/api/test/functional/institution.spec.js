const { test, trait } = use('Test/Suite')('Institution');
const AlgoliaSearch = use('App/Services/AlgoliaSearch');
const Institution = use('App/Models/Institution');
const Factory = use('Factory');
const { antl, errors, errorPayload, roles } = require('../../app/Utils');
const { createUser } = require('../utils/Suts');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const validCnpj = '24.529.265/0001-40';

test('GET /institutions returns all institutions', async ({ client }) => {
	const user = await Factory.model('App/Models/User').create();
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client
		.get('/institutions?order=desc')
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset([institution.toJSON()]);
});

test('GET /institutions/:id returns a institution', async ({ client, assert }) => {
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client.get(`/institutions/${institution.id}`).end();

	response.assertStatus(200);
	assert.equal(response.body.id, institution.id);
});

test('GET /institutions/:id returns a institution by initials', async ({ client, assert }) => {
	const institution = await Factory.model('App/Models/Institution').create();

	const response = await client.get(`/institutions/${institution.initials}`).end();

	response.assertStatus(200);
	assert.equal(response.body.id, institution.id);
});

test('POST /institutions creates a new institution', async ({ client, assert }) => {
	const { user } = await createUser({ append: { status: 'verified' } });
	const institutionFactory = await Factory.model('App/Models/Institution').make();

	const response = await client
		.post('/institutions')
		.loginVia(user, 'jwt')
		.send({ ...institutionFactory.toJSON(), cnpj: validCnpj })
		.end();

	const institutionCreated = await Institution.findOrFail(response.body.institution.id);
	const institutionJson = await institutionCreated.toJSON();

	response.assertStatus(201);
	assert.equal(institutionJson.responsible, user.id);
	assert.equal(institutionJson.name, institutionFactory.name);
	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(AlgoliaSearch.initIndex().saveObject.called);
});

test('PUT /institutions/:id updates an institution', async ({ client, assert }) => {
	const user = await Factory.model('App/Models/User').create();
	const originalInstitution = await Factory.model('App/Models/Institution').create({
		responsible: user.id,
	});
	const modifiedInstitution = {
		...originalInstitution.toJSON(),
		name: 'any name',
		cnpj: validCnpj,
	};

	/** User with a published technology */
	const researcher = await Factory.model('App/Models/User').create();
	const publishedTechnology = await Factory.model('App/Models/Technology').create({
		status: 'published',
	});
	await researcher.technologies().attach(publishedTechnology.id);
	await researcher.institution().associate(originalInstitution);

	const response = await client
		.put(`/institutions/${originalInstitution.id}`)
		.loginVia(user, 'jwt')
		.send(modifiedInstitution)
		.end();

	await originalInstitution.reload();

	response.assertStatus(200);
	assert.equal(originalInstitution.name, modifiedInstitution.name);
	assert.equal(originalInstitution.cnpj, validCnpj);
	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(AlgoliaSearch.initIndex().saveObject.called);
});

test('PUT /institutions/:id/update-responsible updates institution responsible', async ({
	client,
	assert,
}) => {
	const { user: oldResponsibleUser } = await createUser({ append: { status: 'verified' } });
	const { user: newResponsibleUser } = await createUser({ append: { status: 'verified' } });
	const { user: adminUser } = await createUser({
		append: { status: 'verified', role: roles.ADMIN },
	});
	const institution = await Factory.model('App/Models/Institution').create({
		responsible: oldResponsibleUser.id,
	});

	/** User with a published technology */
	const researcher = await Factory.model('App/Models/User').create();
	const publishedTechnology = await Factory.model('App/Models/Technology').create({
		status: 'published',
	});
	await researcher.technologies().attach(publishedTechnology.id);
	await researcher.institution().associate(institution);

	const response = await client
		.put(`/institutions/${institution.id}/update-responsible`)
		.loginVia(adminUser, 'jwt')
		.send({ responsible: newResponsibleUser.id })
		.end();

	const institutionWithNewResponsible = await Institution.findOrFail(response.body.id);

	response.assertStatus(200);
	assert.equal(institutionWithNewResponsible.toJSON().responsible, newResponsibleUser.id);
	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(AlgoliaSearch.initIndex().saveObject.called);
});

test('PUT /institutions/:id/update-responsible returns an error if the user is not authorized', async ({
	client,
}) => {
	const { user: oldResponsibleUser } = await createUser({ append: { status: 'verified' } });
	const { user: newResponsibleUser } = await createUser({ append: { status: 'verified' } });
	const institution = await Factory.model('App/Models/Institution').create({
		responsible: oldResponsibleUser.id,
	});

	const response = await client
		.put(`/institutions/${institution.id}/update-responsible`)
		.loginVia(newResponsibleUser, 'jwt')
		.send({ responsible: newResponsibleUser.id })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('PUT /institutions/:id cannot update an institution with an already existing CNPJ', async ({
	client,
}) => {
	const user = await Factory.model('App/Models/User').create();
	const [alreadyExistentInstitution, anyInstitution] = await Factory.model(
		'App/Models/Institution',
	).createMany(2, {
		responsible: user.id,
	});

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
	const user = await Factory.model('App/Models/User').create();
	const institution = await Factory.model('App/Models/Institution').create({
		responsible: user.id,
	});

	const response = await client
		.delete(`/institutions/${institution.id}`)
		.loginVia(user, 'jwt')
		.end();

	response.assertStatus(200);

	const institutionFromDatabase = await Institution.query()
		.where({ id: institution.id })
		.first();

	assert.isNull(institutionFromDatabase);
	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(
		AlgoliaSearch.initIndex().deleteObject.withArgs(institution.toJSON().objectID).calledOnce,
	);
});

test('PUT/DELETE /institution/:id/ returns an error if the user is not authorized', async ({
	client,
}) => {
	const { user: responsibleUser } = await createUser({ append: { status: 'verified' } });
	const { user: otherUser } = await createUser({ append: { status: 'verified' } });
	const institution = await Factory.model('App/Models/Institution').create({
		responsible: responsibleUser.id,
	});

	let responsePut = await client
		.put(`/institutions/${institution.id}`)
		.loginVia(otherUser, 'jwt')
		.send({ ...institution, name: 'New name institution' })
		.end();

	responsePut.assertStatus(403);
	responsePut.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);

	let responseDelete = await client
		.delete(`/institutions/${institution.id}`)
		.loginVia(otherUser, 'jwt')
		.end();

	responseDelete.assertStatus(403);
	responseDelete.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);

	responsePut = await client
		.put(`/institutions/${institution.id}`)
		.loginVia(responsibleUser, 'jwt')
		.send({ ...institution, name: 'New name institution' })
		.end();

	responsePut.assertStatus(200);

	responseDelete = await client
		.delete(`/institutions/${institution.id}`)
		.loginVia(responsibleUser, 'jwt')
		.end();

	responseDelete.assertStatus(200);
});

test('DELETE /institutions deletes many institutions', async ({ client, assert }) => {
	const { user } = await createUser({ append: { role: roles.ADMIN } });

	const institutions = await Factory.model('App/Models/Institution').createMany(3, {
		responsible: user.id,
	});
	const newInstitutionsIds = institutions.map((institution) => institution.id);

	const response = await client
		.delete(`/institutions?ids=${newInstitutionsIds.join()}`)
		.loginVia(user, 'jwt')
		.end();

	const result = await Institution.query()
		.whereIn('id', newInstitutionsIds)
		.fetch();

	response.assertStatus(200);
	response.assertJSONSubset({ success: true });
	assert.equal(result.toJSON().length, 0);
	assert.isTrue(AlgoliaSearch.initIndex.called);
	newInstitutionsIds.forEach((id) => {
		assert.isTrue(
			AlgoliaSearch.initIndex().deleteObject.withArgs(new Institution().getObjectId({ id }))
				.calledOnce,
		);
	});
});
