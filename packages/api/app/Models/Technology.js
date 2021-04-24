/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Taxonomy = use('App/Models/Taxonomy');
const CE = require('@adonisjs/lucid/src/Exceptions');
const { createUniqueSlug } = require('../Utils/slugify');
const Algolia = require('../Utils/Algolia');
const { roles } = require('../Utils/roles_capabilities');

class Technology extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');

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
				Algolia.initIndex('technology').deleteObject(technology.toJSON().objectID);
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
			query.includeInstitution();
		}

		if (filters.status) {
			const statusList = filters.status?.split(',') || [];
			if (statusList.length) {
				query.whereIn('status', statusList);
			}
		}

		if (filters.title) {
			query.where('title', 'like', `%${filters.title}%`);
		}
	}

	static async scopeIncludeTaxonomy(query) {
		query.with('terms.taxonomy');
	}

	static async scopeIncludeInstitution(query) {
		query.with('users.institution');
	}

	/**
	 * Query scope to get the technology either by id or slug
	 *
	 * @param {object} query The query object.
	 * @param {number|string} technology The technology id or slug
	 * @returns {object}
	 */
	static scopeGetTechnology(query, technology) {
		if (Number.isInteger(Number(technology))) {
			return query.where({ id: technology });
		}
		return query.where({ slug: technology });
	}

	/**
	 * Query scope to get the published tecnologies
	 *
	 * @param {object} query The query object.
	 * @param {object} user User object
	 * @param {string} userRole User Role
	 * @returns {object}
	 */
	static scopeAvailable(query, user = null, userRole = null) {
		if (!user || userRole !== roles.ADMIN) {
			return query.where({ status: 'published' }).where({ active: true });
		}
		return query;
	}

	static scopePopulateForAlgolia(query, id) {
		if (id) {
			query.where({ id });
		}

		query
			.available()
			.with('terms.taxonomy')
			.with('users.role')
			.with('users.institution')
			.with('thumbnail')
			.with('keywords')
			.with('technologyCosts.costs');

		return query;
	}

	/**
	 * Checks if user can access unplisheds technologies
	 *
	 * @param {number|string} technology The technology id or slug
	 * @param {object} user Auth User
	 * @returns {object}
	 */
	static async canAccessUnPublishedTechnology(technology, user) {
		const userRole = await user.getRole();
		if (userRole === roles.ADMIN) return true;

		const isRelatedUser = await technology.checkResponsible(user);
		if (isRelatedUser) return true;

		const technologyReviewer = await technology.getReviewer();

		return technologyReviewer && technologyReviewer.user_id === user.id;
	}

	/**
	 * Gets a technology by its id or slug
	 *
	 * @param {string|number} technology Technology id or slug.
	 * @returns {Technology}
	 */
	static async getTechnology(technology) {
		if (!Number.isNaN(parseInt(technology, 10))) {
			return Technology.findOrFail(technology);
		}

		const technologyInst = await this.query()
			.where({ slug: technology.toUpperCase() })
			.first();

		if (!technologyInst) {
			throw CE.ModelNotFoundException.raise('Technology');
		}
		return technologyInst;
	}

	getObjectId({ id }) {
		return `technology-${id}`;
	}

	terms() {
		return this.belongsToMany('App/Models/Term');
	}

	keywords() {
		return this.belongsToMany('App/Models/Term').withFilters({ taxonomy: 'keywords' });
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

	costs() {
		return this.hasMany('App/Models/TechnologyCost').with('costs');
	}

	thumbnail() {
		return this.belongsTo('App/Models/Upload', 'thumbnail_id');
	}

	reviewers() {
		return this.belongsToMany('App/Models/Reviewer');
	}

	revisions() {
		return this.hasMany('App/Models/Revision');
	}

	comments() {
		return this.hasMany('App/Models/TechnologyComment').with('user');
	}

	knowledgeArea() {
		return this.belongsTo('App/Models/KnowledgeArea', 'knowledge_area_id', 'knowledge_area_id');
	}

	async getOwner() {
		const owner = await this.users()
			.wherePivot('role', 'OWNER')
			.first();
		if (!owner) {
			return this.users().first();
		}
		return owner;
	}

	getReviewer() {
		return this.reviewers().first();
	}

	async checkResponsible(user, role = null) {
		let responsible = this.users()
			.select('id')
			.where({ user_id: user.id });
		if (role) {
			responsible = responsible.wherePivot('role', role);
		}
		responsible = await responsible.first();
		return !!responsible;
	}

	async getTRL() {
		const stageTaxonomy = await Taxonomy.getTaxonomy('STAGE');
		const stage = await this.terms()
			.where({ taxonomy_id: stageTaxonomy.id })
			.first();
		return stage ? stage.slug.split('-')[1] : 0;
	}
}

module.exports = Technology;
