/*
|--------------------------------------------------------------------------
| TechnologyQuestionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

const Technology = use('App/Models/Technology');
const User = use('App/Models/User');

class TechnologyQuestionSeeder {
	async run() {
		const questions = await Factory.model('App/Models/TechnologyQuestion').createMany(30);
		const technologies = await Technology.all();
		const users = await User.all();

		await Promise.all(
			questions.map(async (question) => {
				await question
					.technology()
					.associate(
						technologies.rows[Math.floor(Math.random() * technologies.rows.length)],
					);
				await question
					.user()
					.associate(users.rows[Math.floor(Math.random() * users.rows.length)]);
			}),
		);
	}
}

module.exports = TechnologyQuestionSeeder;