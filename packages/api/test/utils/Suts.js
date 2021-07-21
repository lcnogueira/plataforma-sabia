/** @type {typeof import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Disclaimer = use('App/Models/Disclaimer');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const KnowledgeArea = use('App/Models/KnowledgeArea');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const City = use('App/Models/City');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const State = use('App/Models/State');

const createUser = async ({ append = {} } = {}) => {
	const randomNumber = () => Math.floor(Math.random() * 1000);

	/**
	 * Institution
	 */
	const institution = await Factory.model('App/Models/Institution').create();

	/**
	 * City and State
	 */
	const city = await City.first();
	const state = await State.first();
	/**
	 * User
	 */
	const defaultUser = {
		email: `sabia-${randomNumber()}-testing-${randomNumber()}@gmail.com`,
		password: '123123',
		first_name: 'FirstName',
		last_name: 'LastName',
		company: 'Company',
		zipcode: '9999999',
		cpf: '52100865005',
		birth_date: '1900-01-01',
		phone_number: '(99)23456789',
		lattes_id: '1234567890',
		address: 'Testing address, 99',
		address2: 'Complement 99',
		district: '99',
		country: 'Fictional Country',
	};

	const userToCreate = { ...defaultUser, ...append };
	const user = await User.create({
		...userToCreate,
		institution_id: institution.id,
		city_id: city.id,
		state_id: state.id,
	});
	const userJson = { ...userToCreate, ...user.toJSON() };

	/**
	 * Knowledge Area
	 */
	const knowledgeArea = await KnowledgeArea.findBy('knowledge_area_id', 10000003);
	await user.areas().attach([knowledgeArea.knowledge_area_id]);

	/**
	 * Disclaimers
	 */
	const allTermsOfUse = (
		await Disclaimer.query()
			.select('id')
			.fetch()
	)
		.toJSON()
		.map((term) => term.id);

	if (user) {
		await user.accept(allTermsOfUse);
	}

	return {
		institution,
		user,
		userJson,
	};
};

module.exports = {
	createUser,
};
