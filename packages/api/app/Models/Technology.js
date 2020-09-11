/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Config = use('Adonis/Src/Config');
const algoliasearch = use('App/Services/AlgoliaSearch');
const { createUniqueSlug } = require('../Utils/slugify');

class Technology extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
		const algoliaConfig = Config.get('algolia');
		const indexObject = algoliasearch.initIndex(algoliaConfig.indexName);

		this.addHook('beforeSave', async (technology) => {
			const shouldUpdateSlug =
				!technology.$originalAttributes.title ||
				technology.title !== technology.$originalAttributes.title;

			if (shouldUpdateSlug) {
				// eslint-disable-next-line no-param-reassign
				technology.slug = await createUniqueSlug(this, technology.title);
			}
		});

		this.addHook('afterDelete', async (technology) => {
			try {
				indexObject.deleteObject(technology.toJSON().objectID);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn('Check your algolia settings');
			}
		});
	}

	static get computed() {
		return ['objectID'];
	}

	/**
	 * Runs the technology query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} request The request object.
	 * @returns {object}
	 */
	static async scopeWithFilters(query, request) {
		const { params } = request;
		const filters = request.all();
		// we can reuse query scopes from the term model 😎
		if (filters.term) {
			query
				.whereHas('terms', (builder) => {
					builder.getTerm(filters.term);
				})
				.with('terms', (builder) => {
					builder.getTerm(filters.term);
				});
		}

		if (filters.taxonomy) {
			query.with('terms', (builder) => {
				builder.withFilters({ taxonomy: filters.taxonomy });
			});
		}

		if (params.embed) {
			query.includeTaxonomy();
		}
	}

	static async scopeIncludeTaxonomy(query) {
		query.with('terms.taxonomy');
	}

	/**
	 * Query scope to get the technology either by id or slug
	 *
	 * @param {object} query The query object.
	 * @param {number|string} technology The technology id or slug
	 *
	 * @returns {object}
	 */
	static scopeGetTechnology(query, technology) {
		if (Number.isInteger(Number(technology))) {
			return query.where({ id: technology });
		}

		return query.where({ slug: technology });
	}

	getObjectId({ id }) {
		return `technology-${id}`;
	}

	terms() {
		return this.belongsToMany('App/Models/Term');
	}

	users() {
		return this.belongsToMany('App/Models/User').withPivot(['role']);
	}

	bookmarkUsers() {
		return this.belongsToMany('App/Models/User').pivotTable('user_bookmarks');
	}

	reviews() {
		return this.hasMany('App/Models/TechnologyReview').with('user');
	}

	technologyCosts() {
		return this.hasMany('App/Models/TechnologyCost');
	}

	thumbnail() {
		return this.belongsTo('App/Models/Upload', 'thumbnail_id');
	}

	getOwner() {
		return this.users()
			.wherePivot('role', 'OWNER')
			.first();
	}
}

module.exports = Technology;
