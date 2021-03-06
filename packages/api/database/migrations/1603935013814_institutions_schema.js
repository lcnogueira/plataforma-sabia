/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class InstitutionsSchema extends Schema {
	up() {
		this.create('institutions', (table) => {
			table.increments();
			table
				.integer('user_id')
				.unsigned()
				.references('id')
				.inTable('users')
				.onUpdate('CASCADE')
				.onDelete('SET NULL');
			table.string('name').notNullable();
			table.string('initials').notNullable();
			table.string('cnpj', 18).notNullable();
			table.text('address').notNullable();
			table.string('district').notNullable();
			table.string('zipcode').notNullable();
			table.string('city').notNullable();
			table.string('state').notNullable();
			table.string('lat').notNullable();
			table.string('lng').notNullable();
			table.timestamps();
		});
	}

	down() {
		this.drop('institutions');
	}
}

module.exports = InstitutionsSchema;
