const { test, trait } = use('Test/Suite')('Technology Cost');
const User = use('App/Models/User');
const Technology = use('App/Models/Technology');
const TechnologyCost = use('App/Models/TechnologyCost');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const technology = {
	title: 'Test Title',
	description: 'Test description',
	private: 1,
	thumbnail: 'https://rocketfinalchallenge.s3.amazonaws.com/card-image.jpg',
	likes: 10,
	patent: 1,
	patent_number: '0001/2020',
	primary_purpose: 'Test primary purpose',
	secondary_purpose: 'Test secondary purpose',
	application_mode: 'Test application mode',
	application_examples: 'Test application example',
	installation_time: 365,
	solves_problem: 'Solves problem test',
	entailes_problem: 'Entailes problem test',
	requirements: 'Requirements test',
	risks: 'Test risks',
	contribution: 'Test contribution',
	status: 'DRAFT',
};

const user = {
	email: 'sabiatestingemail@gmail.com',
	password: '123123',
	first_name: 'FirstName',
	last_name: 'LastName',
};

const technologyCost = {
	funding_required: true,
	funding_type: 'PRIVATE',
	funding_value: 200000000,
	funding_status: 'APPROVED',
	notes: 'some additional information',
	costs: [
		{
			cost_type: 'DEVELOPMENT_COST',
			description: 'Exemplo 1 de custo de desenvolvimento',
			type: 'Material',
			quantity: 1,
			value: 10000,
		},
		{
			cost_type: 'IMPLEMENTATION_COST',
			description: 'Exemplo 1 de custo de implantação',
			type: 'Serviço',
			quantity: 1,
			value: 10000,
		},
		{
			cost_type: 'MAINTENANCE_COST',
			description: 'Exemplo 1 de custo de manutenção',
			type: 'Material',
			quantity: 2,
			value: 5000,
		},
	],
};

test('GET technology_costs Get a list of all technology costs', async ({ client }) => {
	const response = await client.get('/technology_costs').end();

	const technologyCosts = await TechnologyCost.all();

	response.assertStatus(200);
	response.assertJSONSubset(technologyCosts.toJSON());
});

test('GET technology_cost by technology id', async ({ client }) => {
	const firstTechnology = await Technology.first();
	const technologyCostInst = await firstTechnology.technologyCosts().first();

	const response = await client.get(`/technology_costs?technologyId=${firstTechnology.id}`).end();

	await technologyCostInst.load('costs');

	response.assertStatus(200);
	technologyCostInst.funding_required = 1;
	response.assertJSONSubset([technologyCostInst.toJSON()]);
});

test('PUT /technologies/:id/costs creates/saves a new technology cost.', async ({ client }) => {
	const loggeduser = await User.create(user);

	const newTechnology = await Technology.create(technology);
	await newTechnology.users().attach([loggeduser.id]);

	const response = await client
		.put(`/technologies/${newTechnology.id}/costs`)
		.loginVia(loggeduser, 'jwt')
		.send(technologyCost)
		.end();

	const technologyCostCreated = await TechnologyCost.find(response.body.id);
	await technologyCostCreated.load('costs');
	technologyCostCreated.funding_required = true;

	response.assertStatus(200);
	response.assertJSONSubset(technologyCostCreated.toJSON());
});

test('PUT /technologies/:id/costs update technology cost details.', async ({ client }) => {
	const loggeduser = await User.create(user);

	const firstTechnology = await Technology.first();
	await firstTechnology.users().attach([loggeduser.id]);

	const updatedTechnologyCost = {
		funding_required: true,
		funding_type: 'PUBLIC',
		funding_value: 10000000,
		funding_status: 'PENDING',
		notes: 'updated notes information',
	};

	const response = await client
		.put(`/technologies/${firstTechnology.id}/costs`)
		.loginVia(loggeduser, 'jwt')
		.send(updatedTechnologyCost)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset(updatedTechnologyCost);
});

test('PUT /technologies/:id/costs update costs details.', async ({ client }) => {
	const loggeduser = await User.create(user);

	const firstTechnology = await Technology.first();
	const technologyCostInst = await firstTechnology.technologyCosts().first();

	await firstTechnology.users().attach([loggeduser.id]);

	await technologyCostInst.load('costs');

	const updatedTechnologyCost = technologyCostInst.toJSON();

	const updatedCost = {
		cost_type: 'DEVELOPMENT_COST',
		description: 'Custo de desenvolvimento adicional',
		type: 'Material',
		quantity: 1,
		value: 10000,
	};

	updatedTechnologyCost.costs[0] = { ...updatedTechnologyCost.costs[0], ...updatedCost };

	const response = await client
		.put(`/technologies/${firstTechnology.id}/costs`)
		.loginVia(loggeduser, 'jwt')
		.send(updatedTechnologyCost)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		costs: [updatedCost],
	});
});

test('PUT /technologies/:id/costs update costs details with new cost.', async ({ client }) => {
	const firstTechnology = await Technology.first();
	const technologyCostInst = await firstTechnology.technologyCosts().first();

	const loggeduser = await User.create(user);
	await firstTechnology.users().attach([loggeduser.id]);

	await technologyCostInst.load('costs');

	const updatedTechnologyCost = technologyCostInst.toJSON();

	const newCost = {
		cost_type: 'DEVELOPMENT_COST',
		description: 'Custo de desenvolvimento adicional',
		type: 'Material',
		quantity: 1,
		value: 10000,
	};

	updatedTechnologyCost.costs.push(newCost);

	const response = await client
		.put(`/technologies/${firstTechnology.id}/costs`)
		.loginVia(loggeduser, 'jwt')
		.send(updatedTechnologyCost)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		costs: [newCost],
	});
});

test('PUT /technologies/:id/costs deletes costs with empty cost array.', async ({ client }) => {
	const firstTechnology = await Technology.first();
	const technologyCostInst = await firstTechnology.technologyCosts().first();

	const loggeduser = await User.create(user);
	await firstTechnology.users().attach([loggeduser.id]);

	await technologyCostInst.load('costs');

	const updatedTechnologyCost = technologyCostInst.toJSON();

	updatedTechnologyCost.costs = [];

	const response = await client
		.put(`/technologies/${firstTechnology.id}/costs`)
		.loginVia(loggeduser, 'jwt')
		.send(updatedTechnologyCost)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		costs: [],
	});
});
