/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const User = use('App/Models/User');
const KnowledgeArea = use('App/Models/KnowledgeArea');

class UserSeeder {
	async run() {
		await Factory.model('App/Models/Institution').createMany(10);

		const users = await Factory.model('App/Models/User').createMany(10);
		const institution = await Factory.model('App/Models/Institution').create();
		await institution.responsible().associate(users[0]);

		const user = await User.find(users[0].id);
		await user.institution().associate(institution);

		const knowledgeArea = await KnowledgeArea.findBy('knowledge_area_id', 10000003);

		const sabiaTestingE2eUser = await User.create({
			institution_id: institution.id,
			email: 'sabiatestinge2e@gmail.com',
			password: 'sabiatesting',
			first_name: 'FirstName',
			last_name: 'LastName',
			status: 'verified',
			company: 'UFERSA',
			address: 'Rua dos Calafates, 405',
			address2: 'Cond. Green Garden, apt 104',
			birth_date: '2020-12-24T03:00:00.000Z',
			city: 'Mossoró',
			state: 'RN',
			city_id: 2408003,
			state_id: 24,
			country: 'Brasil',
			cpf: '71943347042',
			district: 'Alto de São Manoel',
			lattes_id: '1',
			phone_number: '(99) 9999-9999',
			zipcode: '12345123',
		});

		await sabiaTestingE2eUser.areas().attach([knowledgeArea.knowledge_area_id]);

		const sabiaTestingE2eResetPwUser = await User.create({
			institution_id: institution.id,
			email: 'sabiatestinge2eresetpw@gmail.com',
			password: 'sabiatesting',
			first_name: 'FirstName',
			last_name: 'ResetPassword',
			status: 'verified',
			company: 'UFPB',
			address: 'Rua dos Calafates, 405',
			address2: 'Cond. Green Garden, apt 104',
			birth_date: '2020-12-24T03:00:00.000Z',
			city: 'Mossoró',
			state: 'RN',
			city_id: 2408003,
			state_id: 24,
			country: 'Brasil',
			cpf: '40855496002',
			district: 'Alto de São Manoel',
			lattes_id: '1',
			phone_number: '(99) 9999-9999',
			zipcode: '12345123',
		});

		await sabiaTestingE2eResetPwUser.areas().attach([knowledgeArea.knowledge_area_id]);

		const sabiaTestingE2eProfileUser = await User.create({
			institution_id: institution.id,
			email: 'sabiatestinge2eprofile@gmail.com',
			password: 'sabiatesting',
			first_name: 'FirstName',
			last_name: 'ResetPassword',
			status: 'verified',
			company: 'UFRN',
			address: 'Rua dos Calafates, 405',
			address2: 'Cond. Green Garden, apt 104',
			birth_date: '2020-12-24T03:00:00.000Z',
			city: 'Mossoró',
			state: 'RN',
			city_id: 2408003,
			state_id: 24,
			country: 'Brasil',
			cpf: '30522362028',
			district: 'Alto de São Manoel',
			lattes_id: '1',
			phone_number: '(99) 9999-9999',
			zipcode: '12345123',
		});

		await sabiaTestingE2eProfileUser.areas().attach([knowledgeArea.knowledge_area_id]);

		const sabiaTestingAdminUser = await User.create({
			institution_id: institution.id,
			email: 'sabiatestingadmin@gmail.com',
			password: 'sabiatesting',
			first_name: 'AdminName',
			last_name: 'AdminLastName',
			status: 'verified',
			role: 'ADMIN',
			company: 'UFPA',
			address: 'Rua dos Calafates, 405',
			address2: 'Cond. Green Garden, apt 104',
			birth_date: '2020-12-24T03:00:00.000Z',
			city: 'Mossoró',
			state: 'RN',
			city_id: 2408003,
			state_id: 24,
			country: 'Brasil',
			cpf: '25543261004',
			district: 'Alto de São Manoel',
			lattes_id: '1',
			phone_number: '(99) 9999-9999',
			zipcode: '12345123',
		});

		await sabiaTestingAdminUser.areas().attach([knowledgeArea.knowledge_area_id]);
	}
}

module.exports = UserSeeder;
