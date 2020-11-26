/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class TechnologyOrderChatMessage extends Model {
	static boot() {
		super.boot();
		this.addHook('beforeCreate', 'Uuid.generate');
	}

	static get primaryKey() {
		return 'id';
	}

	static get incrementing() {
		return false;
	}
}

module.exports = TechnologyOrderChatMessage;
