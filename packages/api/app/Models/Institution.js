/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Institution extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
	}

	static get computed() {
		return ['objectID'];
	}

	getObjectId({ id }) {
		return `institution-${id}`;
	}

	/**
	 * Query scope to get the institution either by id or initials
	 *
	 * @param {object} query The query object.
	 * @param {number|string} institution The institution id or initials
	 * @returns {object}
	 */
	static scopeGetInstitution(query, institution) {
		if (Number.isInteger(Number(institution))) {
			return query.where({ id: institution });
		}

		return query.where({ initials: institution });
	}

	/**
	 * Runs the institution query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} request The request object.
	 * @returns {object}
	 */
	static async scopeWithFilters(query, request) {
		const filters = request.all();

		/**
		 * Input: Rio de Janeiro
		 * Output: %rio%de%janeiro%
		 */
		if (filters.city) {
			const city = filters.city
				.toLowerCase()
				.split(' ')
				.map((word, index) => (index ? `${word}%` : `%${word}%`))
				.join('');
			query.whereRaw('LOWER(city) LIKE :city', { city });
		}
	}

	static scopePopulateForAlgolia(query, id) {
		if (id) {
			query.where({ id });
		}

		query
			.with('logo')
			.withCount('technologies')
			.withCount('services');

		return query;
	}

	users() {
		return this.hasMany('App/Models/User');
	}

	announcements() {
		return this.hasMany('App/Models/Announcement');
	}

	responsible() {
		return this.belongsTo('App/Models/User', 'responsible');
	}

	logo() {
		return this.belongsTo('App/Models/Upload', 'logo_id');
	}

	technologies() {
		return this.manyThrough('App/Models/User', 'technologies');
	}

	services() {
		return this.manyThrough('App/Models/User', 'services');
	}
}

module.exports = Institution;
