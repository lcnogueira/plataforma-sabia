const { test, trait } = use('Test/Suite')('User Fields Checking');

const Taxonomy = use('App/Models/Taxonomy');
const Factory = use('Factory');

const { antl, errors, errorPayload, roles } = require('../../app/Utils');

const { createUser } = require('../utils/Suts');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

test('POST /technologies checks user personal and organizational data before creates a new technology.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { role: roles.RESEARCHER, address: null },
	});

	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();
	await loggedUser.city().dissociate();
	const unCompletedFields = ['address', 'city_id', 'institution'];

	const technologyFactory = await Factory.model('App/Models/Technology').make();

	const response = await client
		.post('/technologies')
		.loginVia(loggedUser, 'jwt')
		.send(technologyFactory.toJSON())
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /reviewers checks user personal, academic and organizational data before request to be a reviewer.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null, lattes_id: null },
	});

	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();
	const unCompletedFields = ['address', 'lattes_id', 'knowledgeArea', 'institution'];

	const response = await client
		.post('/reviewers')
		.loginVia(loggedUser, 'jwt')
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /announcements checks user personal data before creates a new Announcement', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];

	const keywordTaxonomy = await Taxonomy.getTaxonomy('KEYWORDS');
	const keywordTerms = await Factory.model('App/Models/Term').createMany(5);
	await keywordTaxonomy.terms().saveMany(keywordTerms);
	const keywordTermsIds = keywordTerms.map((keyword) => keyword.id);

	const targetAudienceTerms = await Taxonomy.getTaxonomyTerms('TARGET_AUDIENCE');
	const targetAudienceTermsIds = targetAudienceTerms.rows.map(
		(targetAudience) => targetAudience.id,
	);

	const institution = await Factory.model('App/Models/Institution').create();
	const announcementFactory = await Factory.model('App/Models/Announcement').make({
		institution_id: institution.id,
	});

	const response = await client
		.post('/announcements')
		.loginVia(loggedUser, 'jwt')
		.send({
			...announcementFactory.toJSON(),
			keywords: keywordTermsIds,
			targetAudiences: targetAudienceTermsIds,
		})
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /ideas checks user personal data before creates a new idea', async ({ client }) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];
	const keywordTaxonomy = await Taxonomy.getTaxonomy('KEYWORDS');
	const keywordTerms = await Factory.model('App/Models/Term').createMany(5);
	await keywordTaxonomy.terms().saveMany(keywordTerms);
	const keywordTermsIds = keywordTerms.map((keyword) => keyword.id);

	const response = await client
		.post('/ideas')
		.loginVia(loggedUser, 'jwt')
		.send({
			title: 'wonderfull idea',
			description: 'wonderfull idea description',
			keywords: keywordTermsIds,
		})
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /services checks user personal and organizational data before creates a new Service', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address', 'institution'];

	const serviceFactory = await Factory.model('App/Models/Service').make();

	const keywordTaxonomy = await Taxonomy.getTaxonomy('KEYWORDS');
	const keywordTerms = await Factory.model('App/Models/Term').createMany(5);
	await keywordTaxonomy.terms().saveMany(keywordTerms);
	const keywordTermsIds = keywordTerms.map((keyword) => keyword.id);

	const response = await client
		.post('/services')
		.loginVia(loggedUser, 'jwt')
		.send({
			...serviceFactory.toJSON(),
			keywords: keywordTermsIds,
		})
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /services/orders checks user personal data before creates a new Service Order', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];

	const { user: responsible } = await createUser({ append: { status: 'verified' } });

	const services = await Factory.model('App/Models/Service').createMany(3, {
		user_id: responsible.id,
	});
	const payload = services.map((service) => ({ service_id: service.id, quantity: 2 }));

	const response = await client
		.post('/services/orders')
		.loginVia(loggedUser, 'jwt')
		.send({ services: payload })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /technologies/:id/orders checks user personal data before creates a new technology order', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];

	const { user: owner } = await createUser();
	const technology = await Factory.model('App/Models/Technology').create();
	await technology.users().attach(owner.id);

	const response = await client
		.post(`/technologies/${technology.id}/orders/`)
		.loginVia(loggedUser, 'jwt')
		.send({
			quantity: 1,
			use: 'private',
			funding: 'has_funding',
		})
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /questions checks user personal data before ask a question for a technology', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];
	const { user: owner } = await createUser();
	const technology = await Factory.model('App/Models/Technology').create();
	await technology.users().attach(owner.id);
	const question = 'Whats your favourite kind of weather?';

	const response = await client
		.post(`/questions`)
		.loginVia(loggedUser, 'jwt')
		.send({
			question,
			technology: technology.id,
		})
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /institutions checks user personal data before creates a new institution', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];
	const institutionFactory = await Factory.model('App/Models/Institution').make();

	const response = await client
		.post('/institutions')
		.loginVia(loggedUser, 'jwt')
		.send({ ...institutionFactory.toJSON(), cnpj: '24.529.265/0001-40' })
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});

test('POST /reviews checks user personal data before creates a new technology review.', async ({
	client,
}) => {
	const { user: loggedUser } = await createUser({
		append: { address: null },
	});
	await loggedUser.institution().dissociate();
	await loggedUser.areas().detach();

	const unCompletedFields = ['address'];

	const newTechnology = await Factory.model('App/Models/Technology').create();

	const review = {
		technologyId: newTechnology.id,
		content: 'Test Review',
		rating: 1,
		positive: ['test positive 1', 'test positive 2'],
		negative: ['test negative 1', 'test negative 2'],
	};

	const response = await client
		.post(`/reviews`)
		.loginVia(loggedUser, 'jwt')
		.send(review)
		.end();

	response.assertStatus(403);
	response.assertJSONSubset(
		errorPayload(
			errors.REGISTRATION_UNCOMPLETED,
			antl('error.user.registrationUncompleted', { unCompletedFields }),
		),
	);
});
