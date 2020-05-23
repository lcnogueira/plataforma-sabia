const { test, trait } = use('Test/Suite')('Technology');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const { antl, errors, errorPayload } = require('../../app/Utils');

const Technology = use('App/Models/Technology');
const Taxonomy = use('App/Models/Taxonomy');
const Term = use('App/Models/Term');
const User = use('App/Models/User');

const technology = {
	title: 'TEST_TITLE',
	description: 'TEST_DESCRIPTION',
	logo: 'TEST_LOGO',
	site_url: 'TEST_URL_SITE',
	private: 1,
	category: 'TEST_CATEGORY',
	price: 105.7,
	place: 'TEST_PLACE',
	likes: 10,
	weeks: 10,
	region: 'TEST_REGION',
};

const updatedTechnology = {
	title: 'UPDATED_TITLE',
	description: 'UPDATED_DESCRIPTION',
	logo: 'UPDATED_LOGO',
	private: 1,
	category: 'UPDATED_CATEGORY',
	price: 20.5,
	place: 'UPDATED_PLACE',
	likes: 20,
	weeks: 20,
	region: 'UPDATED_REGION',
};

const invalidField = {
	invalid_field: 'Invalid field',
};

const taxonomy = {
	taxonomy: 'TEST_TAXONOMY',
	description: 'Test Taxonomy.',
};

const user = {
	email: 'sabiatestingemail@gmail.com',
	password: '123123',
	first_name: 'FirstName',
	last_name: 'LastName',
};

test('GET /technologies get list of technologies', async ({ client }) => {
	await Technology.create(technology);

	const response = await client.get('/technologies').end();

	response.assertStatus(200);
	response.assertJSONSubset([technology]);
});

test('GET technologies?term_id= get technologies by term id', async ({ client }) => {
	const tech1 = await Technology.create(technology);
	const tech2 = await Technology.create(technology);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await tech1.terms().attach([testTerm.id]);
	await tech2.terms().attach([testTerm.id]);

	const response = await client.get(`/technologies?term_id=${testTerm.id}`).end();

	response.assertStatus(200);
	response.assertJSONSubset([tech1.toJSON(), tech2.toJSON()]);
});

test('GET technologies?term= get technologies by term slug', async ({ client }) => {
	const tech1 = await Technology.create(technology);
	const tech2 = await Technology.create(technology);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
		slug: 'test-term',
	});

	await tech1.terms().attach([testTerm.id]);
	await tech2.terms().attach([testTerm.id]);

	const response = await client.get(`/technologies?term=${testTerm.slug}`).end();

	response.assertStatus(200);
	response.assertJSONSubset([tech1.toJSON(), tech2.toJSON()]);
});

test('GET /technologies fails with an inexistent technology', async ({ client }) => {
	const response = await client.get('/technologies/12312').end();

	response.assertStatus(400);
});

test('GET /technologies/:id/terms?taxonomy= get technology terms by taxonomy', async ({
	client,
}) => {
	const newTechnology = await Technology.create(technology);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await newTechnology.terms().save(newTerm);

	const response = await client
		.get(`/technologies/${newTechnology.id}/terms?taxonomy=${taxonomy.taxonomy}`)
		.end();

	response.assertStatus(200);

	const terms = await Term.query()
		.whereHas('technologies', (builder) => {
			builder.where('id', newTechnology.id);
		})
		.where('taxonomy_id', testTaxonomy.id)
		.fetch();

	response.assertJSONSubset(terms.toJSON());
});

test('GET /technologies/:id returns a single technology', async ({ client }) => {
	const newTechnology = await Technology.create(technology);

	const response = await client.get(`/technologies/${newTechnology.id}`).end();

	response.assertStatus(200);
	response.assertJSONSubset(newTechnology.toJSON());
});

test('POST /technologies creates/saves a new technology.', async ({ client }) => {
	const loggeduser = await User.create(user);

	const response = await client
		.post('/technologies')
		.loginVia(loggeduser, 'jwt')
		.send(technology)
		.end();

	const technologyCreated = await Technology.find(response.body.id);

	response.assertStatus(200);
	response.assertJSONSubset(technologyCreated.toJSON());
});

/** POST technologies/:idTechnology/users/:idUser */
test('POST technologies/:idTechnology/users/:idUser associates an user with technology.', async ({
	client,
}) => {
	const loggeduser = await User.create(user);

	const newTechnology = await Technology.create(technology);

	const response = await client
		.post(`/technologies/${newTechnology.id}/users/${loggeduser.id}`)
		.loginVia(loggeduser, 'jwt')
		.send({ role: 'OWNER' })
		.end();

	const technologyWithUsers = await Technology.query()
		.with('users')
		.where('id', newTechnology.id)
		.fetch();

	response.assertStatus(200);
	response.assertJSONSubset(technologyWithUsers.toJSON());
});

test('POST /technologies creates/saves a new technology even if an invalid field is provided.', async ({
	client,
}) => {
	const loggeduser = await User.create(user);
	const invalidTechnology = { ...technology, ...invalidField };
	const response = await client
		.post('/technologies')
		.loginVia(loggeduser, 'jwt')
		.send(invalidTechnology)
		.end();

	const technologyCreated = await Technology.find(response.body.id);

	response.assertStatus(200);
	response.assertJSONSubset(technologyCreated.toJSON());
});

test('PUT /technologies/:id Updates technology details', async ({ client }) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggeduser, 'jwt')
		.send(updatedTechnology)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset(updatedTechnology);
});

test('PUT /technologies/:id trying update a technology with in a inexistent term.', async ({
	client,
}) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggeduser, 'jwt')
		.send({ term: 999 })
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'term' }),
		),
	);
});

test('PUT /technologies/:id Updates technology with a new term = termId in body', async ({
	client,
}) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggeduser, 'jwt')
		.send({
			term: newTerm.id,
		})
		.end();

	response.assertStatus(200);
	const technologyTerms = await newTechnology.terms().fetch();
	newTechnology.terms = technologyTerms.toJSON();
	response.assertJSONSubset(newTechnology.toJSON());
});

test('PUT /technologies/:id Updates technology with a new term = termSlug in body', async ({
	client,
}) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
		slug: 'test-term',
	});

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggeduser, 'jwt')
		.send({
			term: newTerm.slug,
		})
		.end();

	response.assertStatus(200);
	const technologyTerms = await newTechnology.terms().fetch();
	newTechnology.terms = technologyTerms.toJSON();
	response.assertJSONSubset(newTechnology.toJSON());
});

test('DELETE /technologies/:id Fails if an inexistent technology is provided.', async ({
	client,
}) => {
	const loggeduser = await User.create(user);

	const response = await client
		.delete(`/technologies/999`)
		.loginVia(loggeduser, 'jwt')
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'technology' }),
		),
	);
});

test('DELETE /technologies/:id Delete a technology with id.', async ({ client }) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const response = await client
		.delete(`/technologies/${newTechnology.id}`)
		.loginVia(loggeduser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		success: true,
	});
});

test('DELETE technologies/:idTechnology/terms/:idTerm Detach a technology term.', async ({
	client,
}) => {
	const newTechnology = await Technology.create(technology);

	const loggeduser = await User.create(user);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await newTechnology.terms().attach([testTerm.id]);

	const response = await client
		.delete(`/technologies/${newTechnology.id}/terms/${testTerm.id}`)
		.loginVia(loggeduser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		success: true,
	});
});
