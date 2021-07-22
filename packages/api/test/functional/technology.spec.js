const { test, trait } = use('Test/Suite')('Technology');
const AlgoliaSearch = use('App/Services/AlgoliaSearch');
const Technology = use('App/Models/Technology');
const Taxonomy = use('App/Models/Taxonomy');
const Term = use('App/Models/Term');
const User = use('App/Models/User');
const Permission = use('App/Models/Permission');
const TechnologyReview = use('App/Models/TechnologyReview');
const TechnologyComment = use('App/Models/TechnologyComment');
const Reviewer = use('App/Models/Reviewer');
const TechnologyOrder = use('App/Models/TechnologyOrder');
const ReviewerTechnologyHistory = use('App/Models/ReviewerTechnologyHistory');
const Revision = use('App/Models/Revision');
const City = use('App/Models/City');
const Factory = use('Factory');
const Bull = use('Rocketseat/Bull');
// const fs = require('fs').promises;

const {
	antl,
	errors,
	errorPayload,
	roles,
	technologyStatuses,
	reviewerStatuses,
	reviewerTechnologyHistoryStatuses,
	technologyLocationsTypes,
} = require('../../app/Utils');
const { prepareTechnology } = require('../../app/Utils/Algolia/indexes/technology');
const { defaultParams } = require('./params.spec');
const { createUser } = require('../utils/Suts');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const technologyDistributionJobKey = 'TechnologyDistribution-key';

// const uploadResponse = {
// 	filename: '1625777337192_logo-crevettic.jpeg',
// 	object: 'technologies',
// 	object_id: 36,
// 	url:
// 		'https://plataforma-sabia-api-staging.s3.sa-east-1.amazonaws.com/resources/uploads/technologies/36/1625777337192_logo-crevettic.jpeg',
// 	user_id: 14,
// 	created_at: '2021-07-08 17:48:57',
// 	updated_at: '2021-07-08 17:48:57',
// 	id: 44,
// };

const invalidField = {
	invalid_field: 'Invalid field',
};

const taxonomy = {
	taxonomy: 'TEST_TAXONOMY',
	description: 'Test Taxonomy.',
};

test('GET /technologies get list of technologies', async ({ client, assert }) => {
	await Factory.model('App/Models/Technology').create();

	const response = await client.get('/technologies').end();

	response.assertStatus(200);
	assert.isAtLeast(response.body.length, 1);
});

test('GET /technologies?term_id= get technologies by term id', async ({ client, assert }) => {
	const tech1 = await Factory.model('App/Models/Technology').create();
	const tech2 = await Factory.model('App/Models/Technology').create();

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await tech1.terms().attach([testTerm.id]);
	await tech2.terms().attach([testTerm.id]);

	const response = await client.get(`/technologies?term_id=${testTerm.id}`).end();

	response.assertStatus(200);
	assert.isAtLeast(response.body.length, 2);
});

test('GET /technologies?term= get technologies by term slug', async ({ client, assert }) => {
	const tech1 = await Factory.model('App/Models/Technology').create();
	const tech2 = await Factory.model('App/Models/Technology').create();

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
		slug: 'test-term',
	});

	await tech1.terms().attach([testTerm.id]);
	await tech2.terms().attach([testTerm.id]);

	const response = await client.get(`/technologies?term=${testTerm.slug}`).end();

	response.assertStatus(200);
	assert.isAtLeast(response.body.length, 2);
});

test('GET /technologies fails with an inexistent technology', async ({ client }) => {
	const { user: loggedUser } = await createUser();

	const response = await client
		.get(`/technologies/99999`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'Technology' }),
		),
	);
});

test('GET /technologies/:id/terms?taxonomy= get technology terms by taxonomy', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await newTechnology.terms().save(newTerm);

	const response = await client
		.get(`/technologies/${newTechnology.id}/terms?taxonomy=${taxonomy.taxonomy}`)
		.loginVia(loggedUser, 'jwt')
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

test('GET /technologies/:id/users get technology users', async ({ client }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	const { user: owner } = await createUser();
	const { user: developer } = await createUser();

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const role = 'DEVELOPER';

	await newTechnology.users().attach([owner.id]);
	await newTechnology.users().attach(developer.id, (row) => {
		row.role = role;
	});

	const response = await client
		.get(`/technologies/${newTechnology.id}/users`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);

	const users = await User.query()
		.whereHas('technologies', (builder) => {
			builder.where('id', newTechnology.id);
		})
		.withParams({ params: defaultParams }, { filterById: false });

	response.assertJSONSubset(users.toJSON());
});

test('GET /technologies/:id/users?role= get technology users by role', async ({ client }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: owner } = await createUser();
	const { user: developer } = await createUser();

	const role = 'DEVELOPER';

	await newTechnology.users().attach([owner.id]);

	await newTechnology.users().attach(developer.id, (row) => {
		// eslint-disable-next-line no-param-reassign
		row.role = role;
	});

	const response = await client
		.get(`/technologies/${newTechnology.id}/users?role=${role}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);

	const users = await User.query()
		.whereHas('technologies', (builder) => {
			builder.where('id', newTechnology.id).where('role', role);
		})
		.withParams({ params: defaultParams }, { filterById: false });

	response.assertJSONSubset(users.toJSON());
});

test('GET /technologies/:id returns a single technology', async ({ client, assert }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const response = await client
		.get(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);
	assert.equal(newTechnology.title, response.body.title);
	assert.equal(newTechnology.id, response.body.id);
});

test('GET /technologies/:id fetch a technology by slug', async ({ client, assert }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const response = await client
		.get(`/technologies/${newTechnology.slug}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);
	assert.equal(newTechnology.title, response.body.title);
	assert.equal(newTechnology.id, response.body.id);
});

test('POST /technologies creates/saves a new technology.', async ({ client, assert }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const technologyFactory = await Factory.model('App/Models/Technology').make();

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send(technologyFactory.toJSON())
		.end();

	const technologyCreated = await Technology.find(response.body.id);
	const technologyUser = await technologyCreated.users().first();

	response.assertStatus(200);
	assert.equal(loggedUser.id, technologyUser.id);
	assert.equal(technologyCreated.title, technologyFactory.title);
});

// test('POST /technologies creates/saves a new technology with thumbnail.', async ({
// 	client,
// 	assert,
// }) => {
// 	const { user } = await createUser({
// 		append: { role: roles.RESEARCHER },
// 	});

// 	assert.isTrue(uploadResponse.url.includes('amazonaws'));

// 	const thumbnail_id = uploadResponse.id;

// 	const technologyFactory = await Factory.model('App/Models/Technology').make();

// 	const response = await client
// 		.post('/technologies')
// 		.loginVia(user, 'jwt')
// 		.send({ ...technologyFactory.toJSON(), thumbnail_id })
// 		.end();

// 	const technologyCreated = await Technology.find(response.body.id);
// 	const technologyUser = await technologyCreated.users().first();
// 	assert.equal(user.id, technologyUser.id);
// 	assert.equal(technologyCreated.thumbnail_id, thumbnail_id);
// 	assert.equal(user.id, response.body.users[0].id);
// });

test('POST /technologies technology slug is not created with unwanted characters', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const technologyFactory = await Factory.model('App/Models/Technology').make();

	const response1 = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send({ ...technologyFactory.toJSON(), title: 'new title test.*+~.()\'"!:@ ' })
		.end();

	const technology_1 = await Technology.find(response1.body.id);
	assert.equal(technology_1.slug, 'new-title-test');
	response1.assertStatus(200);

	const response2 = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send({ ...technologyFactory.toJSON(), title: 'new*+~.()\'"!:@ title test. ' })
		.end();

	const technology_2 = await Technology.find(response2.body.id);
	assert.equal(technology_2.slug, 'new-title-test-1');
	response2.assertStatus(200);

	const response3 = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send({ ...technologyFactory.toJSON(), title: 'new title*+~.()\'"!:@ test. ' })
		.end();

	const technology_3 = await Technology.find(response3.body.id);
	assert.equal(technology_3.slug, 'new-title-test-2');
	response3.assertStatus(200);
});

test('GET /technologies/:id/reviews GET technology reviews.', async ({ client }) => {
	const technologyWithReviews = await Technology.query()
		.has('reviews')
		.first();
	technologyWithReviews.status = technologyStatuses.PUBLISHED;
	await technologyWithReviews.save();

	const response = await client.get(`/technologies/${technologyWithReviews.id}/reviews`).end();

	response.assertStatus(200);
	const reviews = await TechnologyReview.query()
		.whereHas('technology', (builder) => {
			builder.where('id', technologyWithReviews.id);
		})
		.withParams({ params: defaultParams }, { filterById: false });

	response.assertJSONSubset(reviews.toJSON());
});

test('POST /technologies add one count suffix in the slug when it is already stored on our database', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	await Factory.model('App/Models/Technology').create({ title: 'My title' });
	await Factory.model('App/Models/Technology').create({ title: 'My title' });
	const myNewTecnologyData = await Factory.model('App/Models/Technology').make({
		title: 'My title',
	});

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send(myNewTecnologyData.toJSON())
		.end();

	assert.equal(response.body.slug, 'my-title-2');
});

test('POST /technologies does not append the counter in the slug when it is NOT already stored on our database', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const myNewTecnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Should not be stored previosly',
	});

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send(myNewTecnologyData.toJSON())
		.end();

	assert.equal(response.body.slug, 'should-not-be-stored-previosly');
});

test('PUT /technologies/:id/update-status calls algoliasearch.saveObject with default classification, dimension and target audience if no term is provided', async ({
	assert,
	client,
}) => {
	const defaultTermFem = 'Não definida';
	const defaultTermMasc = 'Não definido';

	const { user: loggedUser } = await createUser({ append: { role: roles.ADMIN } });
	const { user: researcher } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const createdTechnology = await Factory.model('App/Models/Technology').create();
	await createdTechnology.users().attach([researcher.id]);

	const response = await client
		.put(`/technologies/${createdTechnology.id}/update-status`)
		.loginVia(loggedUser, 'jwt')
		.send({ status: technologyStatuses.PUBLISHED })
		.end();

	const publishedTechnology = await Technology.findOrFail(response.body.id);
	await publishedTechnology.load('users');

	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(
		AlgoliaSearch.initIndex().saveObject.withArgs(
			prepareTechnology({
				...publishedTechnology.toJSON(),
				classification: defaultTermFem,
				dimension: defaultTermFem,
				targetAudience: defaultTermMasc,
				institution: researcher.institution.initials,
				thumbnail: null,
				videos: publishedTechnology.videos,
			}),
		).calledOnce,
	);
});

test('PUT /technologies/:id/active works sucessfully', async ({ assert, client }) => {
	const { user } = await createUser();

	let createdTechnology = await Factory.model('App/Models/Technology').create({
		active: 0,
		status: 'published',
	});
	await createdTechnology.users().attach([user.id]);

	const response = await client
		.put(`/technologies/${createdTechnology.id}/active`)
		.loginVia(user, 'jwt')
		.end();

	createdTechnology = await Technology.query()
		.select('active')
		.firstOrFail(createdTechnology.id);

	response.assertStatus(204);
	assert.isTrue(!!createdTechnology.active);
	assert.isTrue(AlgoliaSearch.initIndex.called);
});

test('PUT /technologies/:id/update-status calls algoliasearch.saveObject with default classification, dimension and target audience if these terms is not provided', async ({
	assert,
	client,
}) => {
	const defaultTermFem = 'Não definida';
	const defaultTermMasc = 'Não definido';

	const noCategoryTaxonomy = await Taxonomy.create(taxonomy);
	const noCategoryTerm = await noCategoryTaxonomy.terms().create({
		term: 'No Category term',
	});

	const { user: loggedUser } = await createUser({ append: { role: roles.ADMIN } });
	const { user: researcher } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const createdTechnology = await Factory.model('App/Models/Technology').create();
	await createdTechnology.users().attach([researcher.id]);
	await createdTechnology.terms().attach([noCategoryTerm.id]);

	const response = await client
		.put(`/technologies/${createdTechnology.id}/update-status`)
		.loginVia(loggedUser, 'jwt')
		.send({ status: technologyStatuses.PUBLISHED })
		.end();

	const publishedTechnology = await Technology.findOrFail(response.body.id);
	await publishedTechnology.load('users');

	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(
		AlgoliaSearch.initIndex().saveObject.withArgs(
			prepareTechnology({
				...publishedTechnology.toJSON(),
				classification: defaultTermFem,
				dimension: defaultTermFem,
				targetAudience: defaultTermMasc,
				institution: researcher.institution.initials,
				thumbnail: null,
				videos: publishedTechnology.videos,
			}),
		).calledOnce,
	);
});

test('PUT /technologies/:id/update-status calls algoliasearch.saveObject with the classification, dimension and target audience terms if it is provided', async ({
	assert,
	client,
}) => {
	const classification = 'Tecnologias Sociais';
	const dimension = 'Econômica';
	const targetAudience = 'Agricultores';

	const classificationTaxonomy = await Taxonomy.getTaxonomy('CLASSIFICATION');
	const dimensionTaxonomy = await Taxonomy.getTaxonomy('DIMENSION');
	const targetAudienceTaxonomy = await Taxonomy.getTaxonomy('TARGET_AUDIENCE');

	const classificationTerm = await classificationTaxonomy.terms().create({
		term: classification,
	});

	const dimensionTerm = await dimensionTaxonomy.terms().create({
		term: dimension,
	});

	const targetAudienceTerm = await targetAudienceTaxonomy.terms().create({
		term: targetAudience,
	});

	const { user: loggedUser } = await createUser({ append: { role: roles.ADMIN } });
	const { user: researcher } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const createdTechnology = await Factory.model('App/Models/Technology').create();
	await createdTechnology.users().attach([researcher.id]);
	await createdTechnology
		.terms()
		.attach([classificationTerm.id, dimensionTerm.id, targetAudienceTerm.id]);

	const response = await client
		.put(`/technologies/${createdTechnology.id}/update-status`)
		.loginVia(loggedUser, 'jwt')
		.send({ status: technologyStatuses.PUBLISHED })
		.end();

	const publishedTechnology = await Technology.findOrFail(response.body.id);
	await publishedTechnology.loadMany([
		'users',
		'terms.taxonomy',
		'terms.metas',
		'thumbnail',
		'technologyCosts.costs',
	]);

	assert.isTrue(AlgoliaSearch.initIndex.called);
	assert.isTrue(
		AlgoliaSearch.initIndex().saveObject.withArgs(
			prepareTechnology({
				...publishedTechnology.toJSON(),
				classification,
				dimension,
				targetAudience,
				institution: researcher.institution.initials,
				thumbnail: null,
				videos: publishedTechnology.videos,
			}),
		).calledOnce,
	);
});

test('POST /technologies creates/saves a new technology with users.', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const { user: developer } = await createUser();

	const users = [
		{
			id: loggedUser.id,
		},
		{
			id: developer.id,
			role: 'DEVELOPER',
		},
	];

	const technologyFactoryData = await Factory.model('App/Models/Technology').make();

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send({ ...technologyFactoryData.toJSON(), users })
		.end();

	const createdTechnology = await Technology.find(response.body.id);
	await createdTechnology.load('users');

	const usersIds = createdTechnology.toJSON().users.map((user) => user.id);
	const usersToCreate = users.map((user) => user.id);

	response.assertStatus(200);
	assert.deepEqual(usersIds, usersToCreate);
});

test('POST /technologies creates/saves a new technology with terms', async ({ client, assert }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const testTaxonomy = await Taxonomy.create(taxonomy);
	const term1 = await testTaxonomy.terms().create({
		term: 'TERM1',
	});
	const term2 = await testTaxonomy.terms().create({
		term: 'TERM2',
	});

	const technologyFactoryData = await Factory.model('App/Models/Technology').make();

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send({ ...technologyFactoryData.toJSON(), terms: [term1.id, term2.slug] })
		.end();

	const createdTechnology = await Technology.find(response.body.id);
	await createdTechnology.load('terms');

	const technologyCreatedTerms = createdTechnology.toJSON().terms.map((term) => term.id);
	const createdTerms = [term1.toJSON().id, term2.toJSON().id];

	response.assertStatus(200);
	assert.deepEqual(technologyCreatedTerms, createdTerms);
});

/** POST technologies/:idTechnology/users */
test('POST /technologies/:idTechnology/users unauthorized user trying associates users with technology.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const { user: developer } = await createUser();

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const users = [
		{
			id: loggedUser.id,
		},
		{
			email: developer.email,
			role: 'DEVELOPER',
		},
	];
	const response = await client
		.post(`/technologies/${newTechnology.id}/users`)
		.loginVia(loggedUser, 'jwt')
		.send({ users })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('POST /technologies/:id/users associates users with own technology and other users.', async ({
	client,
	assert,
}) => {
	await Bull.reset();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([loggedUser.id]);

	const users = [
		{
			email: 'researcherusertesting@gmail.com',
		},
		{
			email: 'developerusertesting@gmail.com',
		},
	];
	const response = await client
		.post(`/technologies/${newTechnology.id}/users`)
		.loginVia(loggedUser, 'jwt')
		.send({ users })
		.end();

	const newUsers = await newTechnology.users().fetch();

	response.assertStatus(200);
	response.assertJSONSubset(newUsers.toJSON());

	users.forEach((user, index) => {
		const bullCall = Bull.spy.calls[index];
		assert.equal('add', bullCall.funcName);
		assert.equal(user.email, bullCall.args[1].email);
		assert.equal('emails.technology-invitation', bullCall.args[1].template);
		assert.isTrue(Bull.spy.called);
	});
});

test('POST /technologies/:id/terms associates terms with own technology.', async ({ client }) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([loggedUser.id]);

	const keywordsTaxonomy = await Taxonomy.getTaxonomy('KEYWORDS');

	const termInstances = await keywordsTaxonomy
		.terms()
		.createMany([{ term: 'sabia' }, { term: 'testing' }, { term: 'terms' }]);

	const terms = [termInstances[0].id, termInstances[1].slug, termInstances[2].id];
	const response = await client
		.post(`/technologies/${newTechnology.id}/terms`)
		.loginVia(loggedUser, 'jwt')
		.send({ terms })
		.end();

	const newTerms = await newTechnology.terms().fetch();

	response.assertStatus(200);
	response.assertJSONSubset(newTerms.toJSON());
});

/** POST technologies/:id/terms */
test('POST /technologies/:id/terms unauthorized user trying associates terms with technology.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const keywordsTaxonomy = await Taxonomy.getTaxonomy('KEYWORDS');

	const termInstances = await keywordsTaxonomy
		.terms()
		.createMany([{ term: 'sabia' }, { term: 'testing' }, { term: 'terms' }]);

	const terms = [termInstances[0].id, termInstances[1].slug, termInstances[2].id];
	const response = await client
		.post(`/technologies/${newTechnology.id}/terms`)
		.loginVia(loggedUser, 'jwt')
		.send({ terms })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

/** POST technologies/:id/locations */
test('POST /technologies/:id/locations unauthorized user trying associates locations with technology.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const city = await City.first();
	const locationsInsts = await Factory.model('App/Models/Location').createMany(3, {
		city_id: city.id,
	});

	const locations = locationsInsts.map((location) => ({
		location_id: location.id,
		location_type: technologyLocationsTypes.WHERE_IS_ALREADY_IMPLEMENTED,
	}));
	const response = await client
		.post(`/technologies/${newTechnology.id}/locations`)
		.loginVia(loggedUser, 'jwt')
		.send({ locations })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('POST /technologies/:id/locations associates locations with own technology.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach(loggedUser.id);

	const city = await City.first();
	const locationsInsts = await Factory.model('App/Models/Location').createMany(3, {
		city_id: city.id,
	});

	const locations = locationsInsts.map((location) => ({
		location_id: location.id,
		location_type: technologyLocationsTypes.WHERE_IS_ALREADY_IMPLEMENTED,
	}));
	const response = await client
		.post(`/technologies/${newTechnology.id}/locations`)
		.loginVia(loggedUser, 'jwt')
		.send({ locations })
		.end();

	const newLocations = await newTechnology.locations().fetch();

	response.assertStatus(200);
	response.assertJSONSubset(newLocations.toJSON());
});

test('POST /technologies/:id/locations associates same location with two different location types.', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach(loggedUser.id);

	const city = await City.first();
	const locationInst = await Factory.model('App/Models/Location').create({
		city_id: city.id,
	});

	const locations = [
		{
			location_id: locationInst.id,
			location_type: technologyLocationsTypes.WHERE_IS_ALREADY_IMPLEMENTED,
		},
		{
			location_id: locationInst.id,
			location_type: technologyLocationsTypes.WHO_DEVELOP,
		},
	];

	const response = await client
		.post(`/technologies/${newTechnology.id}/locations`)
		.loginVia(loggedUser, 'jwt')
		.send({ locations })
		.end();

	response.assertStatus(200);
	assert.isAtLeast(response.body.length, 2);
});

test('PUT /technologies/:id Unauthorized User trying update technology details', async ({
	client,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send(updatedTechnologyData.toJSON())
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('PUT /technologies/:id User updates own technology details', async ({ client, assert }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Updated title',
	});

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send(updatedTechnologyData.toJSON())
		.end();

	response.assertStatus(200);
	assert.equal(response.body.title, updatedTechnologyData.title);
});

test('PUT /technologies/:id User updates technology details with direct permission', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Updated title',
	});

	const { user: loggedUser } = await createUser({ append: { role: roles.INVESTOR } });
	const updateTechnologiesPermission = await Permission.getPermission('update-technologies');
	await loggedUser.permissions().attach([updateTechnologiesPermission.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send(updatedTechnologyData.toJSON())
		.end();
	response.assertStatus(200);
	assert.equal(response.body.title, updatedTechnologyData.title);
});

test('PUT /technologies/:id User with update technologies permission, updates technologies and call index to algolia', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create({
		status: 'published',
		active: true,
	});
	const newTechnologyTitle = 'Updated title';

	const { user: loggedUser } = await createUser({
		append: { role: roles.ADMIN },
	});
	const { user: owner } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	await newTechnology.users().attach([owner.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({
			title: newTechnologyTitle,
		})
		.end();

	response.assertStatus(200);
	assert.equal(response.body.title, newTechnologyTitle);
	assert.isTrue(AlgoliaSearch.initIndex.called);
});

test('POST /technologies does not create/save a new technology if an inexistent term is provided', async ({
	client,
	assert,
}) => {
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make();
	const technologyWithInvalidTerms = { ...updatedTechnologyData.toJSON(), terms: [99999] };

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const response = await client
		.post(`/technologies`)
		.loginVia(loggedUser, 'jwt')
		.send(technologyWithInvalidTerms)
		.end();

	assert.equal(response.body.id, undefined);

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'Term' }),
		),
	);
});

test('PUT /technologies/:id Updates technology details', async ({ client, assert }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Updated title',
	});

	const { user: loggedUser } = await createUser({ append: { role: roles.INVESTOR } });

	const updateTechnologiesPermission = await Permission.getPermission('update-technologies');
	await loggedUser.permissions().attach([updateTechnologiesPermission.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send(updatedTechnologyData.toJSON())
		.end();

	response.assertStatus(200);
	assert.equal(response.body.title, updatedTechnologyData.title);
});

test('PUT /technologies/:id Updates technology details even if an invalid field is provided.', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Updated title',
	});

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({ ...updatedTechnologyData.toJSON(), ...invalidField })
		.end();

	response.assertStatus(200);
	assert.equal(response.body.title, updatedTechnologyData.title);
});

test('PUT /technologies/:id Updates technology details with users', async ({ client, assert }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const updatedTechnologyData = await Factory.model('App/Models/Technology').make({
		title: 'Updated title',
	});

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const { user: developer } = await createUser();

	const users = [
		{
			id: loggedUser.id,
		},
		{
			id: developer.id,
			role: 'DEVELOPER',
		},
		{
			email: 'inexistentUserEmail@gmail.com',
		},
	];

	newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({ ...updatedTechnologyData.toJSON(), users })
		.end();

	const technologyWithUsers = await Technology.find(response.body.id);
	await technologyWithUsers.load('users');

	response.assertStatus(200);
	assert.equal(response.body.title, updatedTechnologyData.title);
	response.assertJSONSubset({
		users: technologyWithUsers.toJSON().users,
	});
});

test('PUT /technologies/:id Updates technology with terms if terms[termId] is provided', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	await newTechnology.users().attach([loggedUser.id]);

	const testTaxonomy = await Taxonomy.create(taxonomy);
	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({ terms: [newTerm.id] })
		.end();

	response.assertStatus(200);
	await newTechnology.load('terms');
	response.assertJSONSubset({ terms: [newTerm.toJSON()] });
	const technologyTermsId = newTechnology.toJSON().terms[0].id;
	const newTermId = newTerm.toJSON().id;
	assert.equal(technologyTermsId, newTermId);
});

test('PUT /technologies/:id Updates technology with terms if terms[termSlug] is provided', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	await newTechnology.users().attach([loggedUser.id]);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const newTerm = await testTaxonomy.terms().create({
		term: 'test term',
		slug: 'test-term',
	});

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({
			terms: [newTerm.slug],
		})
		.end();

	await newTechnology.load('terms');

	const technologyTermsId = newTechnology.toJSON().terms[0].id;
	const newTermId = newTerm.toJSON().id;

	response.assertStatus(200);
	assert.equal(technologyTermsId, newTermId);
});

test('PUT /technologies/:id does not update a technology if an inexistent term is provided', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({ terms: [99999] })
		.end();

	assert.equal(response.body.id, undefined);

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'Term' }),
		),
	);
});

test('PUT /technologies/:id Updates technology slug with suffix when stored previosly', async ({
	client,
	assert,
}) => {
	await Factory.model('App/Models/Technology').create({ title: 'New title' });
	const newTechnology = await Factory.model('App/Models/Technology').create({
		title: 'My old own title',
	});

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({
			title: 'New title',
		})
		.end();

	assert.equal(response.body.slug, 'new-title-1');
});

test('PUT /technologies/:id Updates technology ignores the slug passed on the body', async ({
	client,
	assert,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create({
		title: 'I am priority',
	});

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.send({
			slug: 'my body slug',
		})
		.end();

	assert.equal(response.body.slug, 'i-am-priority');
});

test('DELETE /technologies/:id Fails if an inexistent technology is provided.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	const response = await client
		.delete(`/technologies/999`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload(
			errors.RESOURCE_NOT_FOUND,
			antl('error.resource.resourceNotFound', { resource: 'Technology' }),
		),
	);
});

test('DELETE /technologies/:id Delete a technology with id.', async ({ client }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.delete(`/technologies/${newTechnology.id}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		success: true,
	});
});

test('DELETE /technologies/:id/terms/:term Detach a technology term.', async ({ client }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	newTechnology.users().attach([loggedUser.id]);

	const testTaxonomy = await Taxonomy.create(taxonomy);

	const testTerm = await testTaxonomy.terms().create({
		term: 'test term',
	});

	await newTechnology.terms().attach([testTerm.id]);

	const response = await client
		.delete(`/technologies/${newTechnology.id}/terms/${testTerm.id}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		success: true,
	});
});

test('DELETE /technologies/:idTechnology/users/:idUser Detach a technology user.', async ({
	client,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});

	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.delete(`/technologies/${newTechnology.id}/users/${loggedUser.id}`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		success: true,
	});
});

/** PUT technologies/:id/users */
test('PUT technologies/:id/update-status no technology reviewer user tryning to update status.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({ append: { role: roles.REVIEWER } });

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const response = await client
		.put(`/technologies/${newTechnology.id}/update-status`)
		.loginVia(loggedUser, 'jwt')
		.send({ status: technologyStatuses.PUBLISHED })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('PUT technologies/:id/update-status admin updates technology status.', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser({ append: { role: roles.ADMIN } });
	const newTechnology = await Factory.model('App/Models/Technology').create();

	const response = await client
		.put(`/technologies/${newTechnology.id}/update-status`)
		.loginVia(loggedUser, 'jwt')
		.send({ status: technologyStatuses.PUBLISHED })
		.end();

	response.assertStatus(200);
	assert.equal(technologyStatuses.PUBLISHED, response.body.status);
});

test('PUT technologies/:id/finalize-registration user finalizes technology register.', async ({
	client,
	assert,
}) => {
	await Bull.reset();

	const { user: loggedUser } = await createUser();

	const newTechnology = await Factory.model('App/Models/Technology').create();

	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/finalize-registration`)
		.loginVia(loggedUser, 'jwt')
		.end();

	const technologyFinalized = await Technology.findOrFail(response.body.id);
	const bullCallTechnologyDistribution = Bull.spy.calls[0];

	response.assertStatus(200);
	response.assertJSONSubset(technologyFinalized.toJSON());
	assert.equal(technologyFinalized.status, technologyStatuses.PENDING);
	assert.equal('add', bullCallTechnologyDistribution.funcName);
	assert.equal(technologyDistributionJobKey, bullCallTechnologyDistribution.args[0]);
	assert.equal(technologyFinalized.title, bullCallTechnologyDistribution.args[1].title);
	assert.isTrue(Bull.spy.called);
});

test('PUT technologies/:id/finalize-registration user finalizes technology register with a comment.', async ({
	client,
	assert,
}) => {
	const { user: loggedUser } = await createUser();

	const newTechnology = await Factory.model('App/Models/Technology').create();

	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/finalize-registration`)
		.send({ comment: 'test comment' })
		.loginVia(loggedUser, 'jwt')
		.end();

	const technologyFinalized = await Technology.findOrFail(response.body.id);
	const comment = await TechnologyComment.findOrFail(response.body.comments[0].id);

	response.assertStatus(200);
	response.assertJSONSubset({ comments: [comment.toJSON()] });
	assert.equal(technologyFinalized.status, technologyStatuses.PENDING);
});

test('PUT technologies/:id/revison researcher sends technology to revison after make changes requested by reviewer.', async ({
	client,
	assert,
}) => {
	await Bull.reset();

	const { user: loggedUser } = await createUser();
	const newTechnology = await Factory.model('App/Models/Technology').create({
		status: technologyStatuses.REQUESTED_CHANGES,
	});
	await newTechnology.users().attach([loggedUser.id]);

	const { user: reviewer } = await createUser({ append: { role: roles.REVIEWER } });
	const approvedReviewer = await Reviewer.create({
		user_id: reviewer.id,
		status: reviewerStatuses.APPROVED,
	});

	await approvedReviewer.technologies().attach([newTechnology.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/revision`)
		.send({ comment: 'changes maded' })
		.loginVia(loggedUser, 'jwt')
		.end();

	const technologyReviewed = await Technology.findOrFail(response.body.id);
	const comment = await TechnologyComment.findOrFail(response.body.comments[0].id);

	assert.equal(technologyReviewed.status, technologyStatuses.CHANGES_MADE);

	response.assertStatus(200);
	response.assertJSONSubset({ comments: [comment.toJSON()] });

	const bullCall = Bull.spy.calls[0];
	assert.equal('add', bullCall.funcName);
	assert.equal(reviewer.email, bullCall.args[1].email);
	assert.equal('emails.changes-made', bullCall.args[1].template);
	assert.isTrue(Bull.spy.called);
});

test('GET /technologies/:id/comments only technology related users or reviewer can list comments', async ({
	client,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const { user: technologyOwnerUser } = await createUser();
	await newTechnology.users().attach([technologyOwnerUser.id]);

	await TechnologyComment.create({
		user_id: technologyOwnerUser.id,
		technology_id: newTechnology.id,
		comment: 'test comment',
	});

	const { user: loggedUser } = await createUser();

	const response = await client
		.get(`/technologies/${newTechnology.id}/comments`)
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('GET /technologies/:id/comments onwer user list comments', async ({ client }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const { user: technologyOwnerUser } = await createUser();
	await newTechnology.users().attach([technologyOwnerUser.id]);

	await TechnologyComment.create({
		user_id: technologyOwnerUser.id,
		technology_id: newTechnology.id,
		comment: 'test comment',
	});

	const response = await client
		.get(`/technologies/${newTechnology.id}/comments`)
		.loginVia(technologyOwnerUser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset([{ comment: 'test comment' }]);
});

test('GET /technologies/:id/comments technology reviewer list comments', async ({ client }) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const { user: technologyOwnerUser } = await createUser();
	await newTechnology.users().attach([technologyOwnerUser.id]);

	await TechnologyComment.create({
		user_id: technologyOwnerUser.id,
		technology_id: newTechnology.id,
		comment: 'test comment',
	});

	const { user: reviewer } = await createUser({ append: { role: roles.REVIEWER } });
	const approvedReviewer = await Reviewer.create({
		user_id: reviewer.id,
		status: reviewerStatuses.APPROVED,
	});
	await approvedReviewer.technologies().attach([newTechnology.id]);

	const response = await client
		.get(`/technologies/${newTechnology.id}/comments`)
		.loginVia(reviewer, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset([{ comment: 'test comment' }]);
});

test('POST technologies/:id/orders user makes a technology order.', async ({ client }) => {
	const { user: buyer } = await createUser();
	const { user: seller } = await createUser({ append: { role: roles.RESEARCHER } });

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([seller.id]);

	const response = await client
		.post(`/technologies/${newTechnology.id}/orders`)
		.send({
			quantity: 1,
			use: 'private',
			funding: 'no_need_funding',
		})
		.loginVia(buyer, 'jwt')
		.end();

	const technologyOrder = await TechnologyOrder.find(response.body.id);
	response.body.comment = null;
	response.body.cancellation_reason = null;
	response.body.unit_value = null;

	response.assertStatus(200);
	response.assertJSONSubset(technologyOrder.toJSON());
});

test('PUT technologies/:id/reviewer returns an error if the user is not authorized.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser();
	const { user: reviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});

	const approvedReviewer = await Reviewer.create({
		user_id: reviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/reviewer`)
		.send({ reviewer: approvedReviewer.id })
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('PUT technologies/:id/reviewer admin associates reviewer to technology.', async ({
	client,
	assert,
}) => {
	await Bull.reset();
	const { user: adminUser } = await createUser({
		append: { role: roles.ADMIN },
	});
	const { user: ownerUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	const { user: oldReviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});
	const { user: newReviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});

	const oldReviewer = await Reviewer.create({
		user_id: oldReviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});
	const newReviewer = await Reviewer.create({
		user_id: newReviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([ownerUser.id]);
	await oldReviewer.technologies().attach([newTechnology.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/reviewer`)
		.send({ reviewer: newReviewer.id })
		.loginVia(adminUser, 'jwt')
		.end();

	response.assertStatus(200);
	const bullCallRevisionRevoked = Bull.spy.calls[0];
	assert.equal('add', bullCallRevisionRevoked.funcName);
	assert.equal(oldReviewerUser.email, bullCallRevisionRevoked.args[1].email);
	assert.equal('emails.technology-revision-revoked', bullCallRevisionRevoked.args[1].template);

	const bullCallNewReviewer = Bull.spy.calls[1];
	assert.equal('add', bullCallNewReviewer.funcName);
	assert.equal(newReviewerUser.email, bullCallNewReviewer.args[1].email);
	assert.equal('emails.technology-reviewer', bullCallNewReviewer.args[1].template);

	assert.isTrue(Bull.spy.called);
});

test('PUT technologies/:id/disassociate-reviewer returns an error if the user is not authorized.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser();
	const { user: reviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});

	const approvedReviewer = await Reviewer.create({
		user_id: reviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();

	await newTechnology.users().attach([loggedUser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/disassociate-reviewer`)
		.send({ reviewer: approvedReviewer.id })
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
	);
});

test('PUT technologies/:id/disassociate-reviewer admin disassociates technology reviewer.', async ({
	client,
	assert,
}) => {
	await Bull.reset();
	const { user: adminUser } = await createUser({
		append: { role: roles.ADMIN },
	});
	const { user: ownerUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	const { user: oldReviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});

	const oldReviewer = await Reviewer.create({
		user_id: oldReviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([ownerUser.id]);
	await oldReviewer.technologies().attach([newTechnology.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/disassociate-reviewer`)
		.loginVia(adminUser, 'jwt')
		.end();

	response.assertStatus(200);
	const bullCallRevisionRevoked = Bull.spy.calls[0];
	assert.equal('add', bullCallRevisionRevoked.funcName);
	assert.equal(oldReviewerUser.email, bullCallRevisionRevoked.args[1].email);
	assert.equal('emails.technology-revision-revoked', bullCallRevisionRevoked.args[1].template);

	assert.isTrue(Bull.spy.called);
});

test('PUT /technologies/:id Update technology details with embedded data', async ({
	client,
	assert,
}) => {
	const { user: admin } = await createUser({ append: { role: roles.ADMIN } });
	const users = await Factory.model('App/Models/User').createMany(3);
	const usersIds = users.map((user) => user.id);

	const keywords = await Taxonomy.getTaxonomy('KEYWORDS');
	const keywordsTerms = await keywords
		.terms()
		.createMany([{ term: 'Term1' }, { term: 'Term2' }, { term: 'Term3' }]);
	const keywordsIds = keywordsTerms.map((key) => key.id);

	const technologyT = await Factory.model('App/Models/Technology').create();
	await technologyT.users().attach(usersIds);
	await technologyT.terms().attach(keywordsIds);

	const responseGet = await client
		.get(`/technologies/${technologyT.id}?embed`)
		.loginVia(admin, 'jwt')
		.end();

	const newKeywordsTerms = await keywords
		.terms()
		.createMany([{ term: 'Term4' }, { term: 'Term5' }, { term: 'Term6' }]);
	const newKeywordsIds = newKeywordsTerms.map((key) => key.id);

	const responsePut = await client
		.put(`/technologies/${technologyT.id}`)
		.send({ ...responseGet.body, terms: newKeywordsIds })
		.loginVia(admin, 'jwt')
		.end();
	responsePut.assertStatus(200);
	const terms = await technologyT.terms().fetch();
	const termsIds = terms.rows.map((term) => term.id);
	assert.equal(JSON.stringify(termsIds), JSON.stringify(newKeywordsIds));
});

test('GET /technologies/:id/revision-history gets technology revision history', async ({
	client,
}) => {
	const newTechnology = await Factory.model('App/Models/Technology').create();
	const { user: technologyOwnerUser } = await createUser();
	await newTechnology.users().attach([technologyOwnerUser.id]);

	const { user: reviewer } = await createUser({ append: { role: roles.REVIEWER } });
	const approvedReviewer = await Reviewer.create({
		user_id: reviewer.id,
		status: reviewerStatuses.APPROVED,
	});
	await approvedReviewer.technologies().attach([newTechnology.id]);

	const { user: adminUser } = await createUser({
		append: { role: roles.ADMIN },
	});

	// History
	const firstComment = await TechnologyComment.create({
		technology_id: newTechnology.id,
		user_id: technologyOwnerUser.id,
		comment: 'first comment',
	});
	const firstRevision = await Revision.create({
		technology_id: newTechnology.id,
		reviewer_id: approvedReviewer.id,
		description: 'first revision',
		assessment: 'requested_changes',
	});
	const secondComment = await TechnologyComment.create({
		technology_id: newTechnology.id,
		user_id: technologyOwnerUser.id,
		comment: 'second comment',
	});
	const lastRevision = await Revision.create({
		technology_id: newTechnology.id,
		reviewer_id: approvedReviewer.id,
		description: 'last revision',
		assessment: 'approved',
	});

	const response = await client
		.get(`/technologies/${newTechnology.id}/revision-history`)
		.loginVia(adminUser, 'jwt')
		.end();

	response.assertStatus(200);
	response.assertJSONSubset([
		firstComment.toJSON(),
		firstRevision.toJSON(),
		secondComment.toJSON(),
		lastRevision.toJSON(),
	]);
});

test('GET /technologies/:id/reviewer-history gets technology reviewer history', async ({
	client,
	assert,
}) => {
	await Bull.reset();
	const { user: adminUser } = await createUser({
		append: { role: roles.ADMIN },
	});
	const { user: ownerUser } = await createUser({
		append: { role: roles.RESEARCHER },
	});
	const { user: oldReviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});
	const { user: newReviewerUser } = await createUser({
		append: { role: roles.REVIEWER },
	});

	const oldReviewer = await Reviewer.create({
		user_id: oldReviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});
	const newReviewer = await Reviewer.create({
		user_id: newReviewerUser.id,
		status: reviewerStatuses.APPROVED,
	});

	const newTechnology = await Factory.model('App/Models/Technology').create();
	await newTechnology.users().attach([ownerUser.id]);
	await oldReviewer.technologies().attach([newTechnology.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/reviewer`)
		.send({ reviewer: newReviewer.id })
		.loginVia(adminUser, 'jwt')
		.end();

	const reviewerHistory = await ReviewerTechnologyHistory.query()
		.where({
			technology_id: newTechnology.id,
		})
		.fetch();

	assert.equal(reviewerHistory.rows[0].reviewer_id, oldReviewer.id);
	assert.equal(reviewerHistory.rows[0].status, reviewerTechnologyHistoryStatuses.UNASSIGNED);

	assert.equal(reviewerHistory.rows[1].reviewer_id, newReviewer.id);
	assert.equal(reviewerHistory.rows[1].status, reviewerTechnologyHistoryStatuses.ASSIGNED);

	response.assertStatus(200);
	const bullCallRevisionRevoked = Bull.spy.calls[0];
	assert.equal('add', bullCallRevisionRevoked.funcName);
	assert.equal(oldReviewerUser.email, bullCallRevisionRevoked.args[1].email);
	assert.equal('emails.technology-revision-revoked', bullCallRevisionRevoked.args[1].template);

	const bullCallNewReviewer = Bull.spy.calls[1];
	assert.equal('add', bullCallNewReviewer.funcName);
	assert.equal(newReviewerUser.email, bullCallNewReviewer.args[1].email);
	assert.equal('emails.technology-reviewer', bullCallNewReviewer.args[1].template);

	assert.isTrue(Bull.spy.called);
});
