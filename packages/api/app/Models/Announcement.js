/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const { roles } = require('../Utils/roles_capabilities');

class Announcement extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
	}

	static get computed() {
		return ['objectID'];
	}

	getObjectId({ id }) {
		return `announcement-${id}`;
	}

	user() {
		return this.belongsTo('App/Models/User');
	}

	institution() {
		return this.belongsTo('App/Models/Institution');
	}

	terms() {
		return this.belongsToMany('App/Models/Term');
	}

	keywords() {
		return this.belongsToMany('App/Models/Term').withFilters({ taxonomy: 'keywords' });
	}

	targetAudiences() {
		return this.belongsToMany('App/Models/Term').withFilters({ taxonomy: 'target_audience' });
	}

	/**
	 * Query scope to get the published tecnologies
	 *
	 * @param {object} query The query object.
	 * @param {object} user User object
	 * @param {string} userRole User Role
	 * @returns {object}
	 */
	static scopePublished(query, user = null, userRole = null) {
		if (!user || userRole !== roles.ADMIN) {
			return query.where({ status: 'published' });
		}
		return query;
	}

	/**
	 * Runs the term query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} filters The query filters
	 *
	 * @returns {object}
	 */
	static scopeWithFilters(query, filters) {
		if (filters.title) {
			query.where('title', 'LIKE', `%${filters.title}%`);
		}
		if (filters.description) {
			query.where('description', 'LIKE', `%${filters.description}%`);
		}

		if (filters.keywords) {
			const keywordsList = filters?.keywords.split(',') || [];
			if (keywordsList.length) {
				query.whereHas('terms', (builder) => {
					builder.whereIn('id', keywordsList);
				});
			}
		}

		if (filters.targetAudiences) {
			const targetAudiencesList = filters?.targetAudiences.split(',') || [];
			if (targetAudiencesList.length) {
				query.whereHas('terms', (builder) => {
					builder.whereIn('id', targetAudiencesList);
				});
			}
		}

		return query;
	}

	static scopePopulateForAlgolia(query, id) {
		if (id) {
			query.where({ id });
		}

		query
			.published()
			.with('keywords')
			.with('institution')
			.with('targetAudiences');

		return query;
	}
}

module.exports = Announcement;
