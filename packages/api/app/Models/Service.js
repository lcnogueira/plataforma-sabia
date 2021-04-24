/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Service extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
	}

	getObjectId({ id }) {
		return `service-${id}`;
	}

	static get computed() {
		return ['objectID'];
	}

	user() {
		return this.belongsTo('App/Models/User');
	}

	keywords() {
		return this.belongsToMany('App/Models/Term').withFilters({ taxonomy: 'keywords' });
	}

	serviceOrders() {
		return this.hasMany('App/Models/ServiceOrder');
	}

	thumbnail() {
		return this.belongsTo('App/Models/Upload', 'thumbnail_id');
	}

	bookmarkUsers() {
		return this.belongsToMany('App/Models/User').pivotTable('service_bookmarks');
	}

	/**
	 * Runs the service query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} filters The query filters
	 *
	 * @returns {object}
	 */
	static scopeWithFilters(query, filters) {
		if (filters.name) {
			query.where('name', 'LIKE', `%${filters.name}%`);
		}
		if (filters.description) {
			query.where('description', 'LIKE', `%${filters.description}%`);
		}

		if (filters.type) {
			const typeList = filters.type?.split(',') || [];
			if (typeList.length) {
				query.whereIn('type', typeList);
			}
		}

		if (filters.measure_unit) {
			const muList = filters.measure_unit?.split(',') || [];
			if (muList.length) {
				query.whereIn('measure_unit', muList);
			}
		}

		if (filters.keywords) {
			const keywordsList = filters?.keywords.split(',') || [];
			if (keywordsList.length) {
				query.whereHas('keywords', (builder) => {
					builder.whereIn('id', keywordsList);
				});
			}
		}

		if (filters.institution) {
			query.whereHas('user', (builder) => {
				builder.where('institution_id', filters.institution);
			});
		}

		return query;
	}

	/**
	 * Query scope to get the avaliable services
	 *
	 * @param {object} query The query object.
	 * @returns {object}
	 */
	static scopeAvailable(query) {
		return query.where({ active: true });
	}

	static scopePopulateForAlgolia(query, id) {
		if (id) {
			query.where({ id });
		}

		query.with('keywords').with('user.institution');

		return query;
	}
}

module.exports = Service;
