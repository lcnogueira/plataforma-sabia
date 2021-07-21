/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/
/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const Config = use('Adonis/Src/Config');

const {
	technologyStatuses,
	technologyUseStatuses,
	fundingStatuses,
	orderStatuses,
	disclaimersTypes,
	technologiesTypes,
	announcementStatuses,
	institutionsTypes,
	institutionsCategories,
	messagesTypes,
	messageStatuses,
	servicesTypes,
	serviceMeasureUnits,
	serviceOrderStatuses,
	costsMeasureUnit,
} = require('../app/Utils');

const knowledgeAreas = require('../resources/json/knowledge_areas.json');

const firstKnowledgeAreaId = knowledgeAreas[0].CODIGO_AREA_CONHECIMENTO;

Factory.blueprint('App/Models/User', async (faker, i, data) => {
	return {
		email: faker.email(),
		password: faker.string(),
		first_name: faker.string(),
		last_name: faker.string(),
		company: faker.string(),
		zipcode: faker.zip(),
		cpf: faker.string({ length: 11, numeric: true }),
		birth_date: faker.date(),
		phone_number: faker.phone({ country: 'br', mobile: false }),
		lattes_id: faker.string({ length: 11, numeric: true }),
		address: faker.string(),
		address2: faker.string(),
		district: faker.string(),
		country: faker.string(),
		role_id: 1,
		...data,
	};
});

Factory.blueprint('App/Models/Technology', (faker, i, data) => {
	return {
		title: faker.sentence({ words: 3 }),
		description: faker.paragraph(),
		private: faker.bool(),
		likes: 0,
		patent: faker.bool(),
		patent_number: faker.string({ length: 8, alpha: true, numeric: true }),
		primary_purpose: faker.paragraph(),
		secondary_purpose: faker.paragraph(),
		application_mode: faker.paragraph(),
		application_examples: faker.paragraph(),
		installation_time: faker.integer({ min: 1, max: 800 }),
		solves_problem: faker.paragraph(),
		entailes_problem: faker.paragraph(),
		requirements: faker.paragraph(),
		risks: faker.paragraph(),
		contribution: faker.paragraph(),
		intellectual_property: faker.bool(),
		status: technologyStatuses.PUBLISHED,
		type: faker.pickone(Object.values(technologiesTypes)),
		public_domain: faker.bool(),
		knowledge_area_id: firstKnowledgeAreaId,
		active: true,
		videos: JSON.stringify([
			{
				link: 'https://www.youtube.com/watch?v=8h7p88oySWY',
				videoId: '8h7p88oySWY',
				provider: 'Youtube',
				thumbnail: 'http://i3.ytimg.com/vi/8h7p88oySWY/hqdefault.jpg',
			},
		]),
		...data,
	};
});

Factory.blueprint('App/Models/Term', async (faker, i, data) => {
	return {
		term: faker.word({ syllables: 6 }),
		slug: `${faker.word({ syllables: 6 })}-${new Date().getTime()}`,
		...data,
	};
});

Factory.blueprint('App/Models/TechnologyReview', async (faker, i, data) => {
	return {
		content: faker.paragraph(),
		rating: faker.integer({ min: 1, max: 5 }),
		positive: JSON.stringify([faker.sentence(), faker.sentence()]),
		negative: JSON.stringify([faker.sentence(), faker.sentence()]),
		...data,
	};
});

Factory.blueprint('App/Models/TechnologyCost', async (faker, i, data) => {
	return {
		funding_required: true,
		funding_type: faker.pickone(['public', 'private', 'collective']),
		funding_value: faker.integer({ min: 10, max: 100000000 }),
		funding_status: faker.pickone(['not_acquired', 'acquiring', 'acquired']),
		notes: faker.paragraph(),
		is_seller: faker.bool(),
		price: faker.integer({ min: 10, max: 100000000 }),
		...data,
	};
});

Factory.blueprint('App/Models/Cost', async (faker, i, data) => {
	return {
		cost_type: faker.pickone([
			'development_costs',
			'implementation_costs',
			'maintenance_costs',
		]),
		description: faker.sentence({ words: 10 }),
		type: faker.pickone(['service', 'equipment', 'others', 'raw_input']),
		quantity: faker.integer({ min: 1, max: 100 }),
		value: faker.integer({ min: 10, max: 100000000 }),
		measure_unit: faker.pickone(Object.values(costsMeasureUnit)),
		...data,
	};
});

Factory.blueprint('App/Models/Revision', async (faker, i, data) => {
	return {
		assessment: faker.pickone(['approved', 'requested_changes', 'rejected']),
		description: faker.sentence({ words: 15 }),
		...data,
	};
});

Factory.blueprint('App/Models/Institution', async (faker, i, data) => {
	return {
		name: faker.company(),
		initials: faker.string({ length: 5, casing: 'upper', alpha: true }),
		cnpj: faker
			.string({ length: 14, casing: 'upper', numeric: true })
			.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
		address: faker.address(),
		district: faker.string(),
		zipcode: faker.zip(),
		city: faker.city(),
		state: faker.state(),
		lat: String(faker.latitude()),
		lng: String(faker.longitude()),
		email: faker.email(),
		phone_number: faker.phone({ country: 'br', mobile: false }),
		website: faker.url(),
		type: faker.pickone(Object.values(institutionsTypes)),
		category: faker.pickone(Object.values(institutionsCategories)),
		...data,
	};
});

Factory.blueprint('App/Models/TechnologyQuestion', async (faker, i, data) => {
	return {
		question: faker.sentence({ words: 5 }),
		answer: faker.sentence(),
		status: faker.pickone(['unanswered', 'answered', 'disabled']),
		...data,
	};
});

Factory.blueprint('App/Models/TechnologyOrder', async (faker, i, data) => {
	return {
		quantity: faker.integer({ min: 1, max: 100 }),
		unit_value: faker.integer({ min: 10, max: 1000 }),
		use: faker.pickone(Object.values(technologyUseStatuses)),
		funding: faker.pickone(Object.values(fundingStatuses)),
		status: orderStatuses.OPEN,
		comment: faker.paragraph(),
		...data,
	};
});

Factory.blueprint('App/Models/Disclaimer', async (faker, i, data) => {
	return {
		description: faker.sentence({ words: 10 }),
		required: faker.integer({ min: 0, max: 1 }),
		type: faker.pickone(Object.values(disclaimersTypes)),
		version: faker.string({ length: 5 }),
		...data,
	};
});

Factory.blueprint('App/Models/Announcement', async (faker, i, data) => {
	return {
		institution_id: data.institution_id,
		announcement_number: `${faker.integer({ min: 1, max: 100 })}/${new Date().getFullYear()}`,
		title: faker.sentence({ words: 3 }),
		description: faker.sentence({ words: 10 }),
		financial_resources: faker.integer({ min: 0, max: 100000 }),
		start_date: faker.date({ string: true }),
		end_date: faker.date({ string: true }),
		comment: faker.sentence({ words: 5 }),
		url: faker.url(),
		status: announcementStatuses.PENDING,
		...data,
	};
});

Factory.blueprint('App/Models/Message', async (faker, i, data) => {
	return {
		subject: faker.sentence({ words: 5 }),
		content: faker.paragraph(),
		type: faker.pickone(Object.values(messagesTypes)),
		status: faker.pickone(Object.values(messageStatuses)),
		...data,
	};
});

Factory.blueprint('App/Models/Idea', async (faker, i, data) => {
	return {
		title: faker.sentence({ words: 5 }),
		description: faker.sentence({ words: 10 }),
		...data,
	};
});

Factory.blueprint('App/Models/Service', async (faker, i, data) => {
	return {
		name: faker.sentence({ words: 5 }),
		description: faker.sentence({ words: 10 }),
		type: faker.pickone(Object.values(servicesTypes)),
		price: faker.integer({ min: 10, max: 100000 }),
		measure_unit: faker.pickone(Object.values(serviceMeasureUnits)),
		payment_message: faker.sentence({ words: 10 }),
		active: 1,
		...data,
	};
});

Factory.blueprint('App/Models/ServiceOrder', async (faker, i, data) => {
	return {
		quantity: faker.integer({ min: 1, max: 100 }),
		unit_value: faker.integer({ min: 10, max: 1000 }),
		status: serviceOrderStatuses.REQUESTED,
		comment: faker.paragraph(),
		...data,
	};
});

Factory.blueprint('App/Models/ServiceOrderReview', async (faker, i, data) => {
	return {
		content: faker.paragraph(),
		rating: faker.integer({ min: 1, max: 5 }),
		positive: JSON.stringify([faker.sentence(), faker.sentence()]),
		negative: JSON.stringify([faker.sentence(), faker.sentence()]),
		...data,
	};
});

Factory.blueprint('App/Models/TechnologyComment', async (faker, i, data) => {
	return {
		comment: faker.paragraph(),
		...data,
	};
});

Factory.blueprint('App/Models/DeviceToken', async (faker, i, data) => {
	return {
		device_uuid: faker.guid(),
		device_token: faker.android_id(),
		...data,
	};
});

Factory.blueprint('App/Models/Upload', async (faker, i, data) => {
	return {
		filename: `${faker.word({ length: 20 })}.${faker.pickone(
			Config.get('upload.allowedFormats'),
		)}`,
		...data,
	};
});

Factory.blueprint('App/Models/Location', async (faker, i, data) => {
	return {
		place_id: faker.hash(),
		address: faker.address(),
		city_id: data.city_id,
		lat: String(faker.latitude()),
		lng: String(faker.longitude()),
		...data,
	};
});
