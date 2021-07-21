/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const Database = use('Database');

class UserCityStateSchema extends Schema {
	up() {
		this.alter('users', (table) => {
			// alter table
			table
				.integer('city_id')
				.after('city')
				.unsigned();
			table
				.integer('state_id')
				.after('state')
				.unsigned();
		});
		this.schedule(async (trx) => {
			const usersWithCity = await Database.table('users')
				.whereNotNull('city')
				.transacting(trx);

			for await (const user of usersWithCity) {
				// Trying to update the user's city
				const userCity = await Database.table('cities')
					.whereRaw('UPPER(name) = UPPER(?)', [user.city])
					.first();

				if (userCity) {
					await Database.table('users')
						.where('id', user.id)
						.update({ city_id: userCity.id });
				}

				// Trying to update the user's state
				const userState = await Database.table('states')
					.whereRaw('UPPER(name) = UPPER(?) OR UPPER(initials) = UPPER(?)', [
						user.state,
						user.state,
					])
					.first();

				if (userState) {
					await Database.table('users')
						.where('id', user.id)
						.update({ state_id: userState.id });
				}
			}
		});
	}

	down() {
		this.alter('users', (table) => {
			// reverse alternations
			table.dropForeign(['city_id']).dropColumn('city_id');
			table.dropForeign(['state_id']).dropColumn('state_id');
		});
	}
}

module.exports = UserCityStateSchema;
