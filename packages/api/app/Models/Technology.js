/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Config = use('Adonis/Src/Config');
const algoliasearch = use('App/Services/AlgoliaSearch');
const slugify = require('slugify');

class Technology extends Model {
	static boot() {
		super.boot();
		const algoliaConfig = Config.get('algolia');
		const indexObject = algoliasearch.initIndex(algoliaConfig.indexName);

		this.addHook('beforeSave', async (technology) => {
			// eslint-disable-next-line no-param-reassign
			technology.slug = slugify(technology.title, { lower: true });
		});

		if (algoliaConfig.apiKey) {
			this.addHook('afterSave', async (technology) => {
				indexObject.saveObject(technology.toJSON());
			});

			this.addHook('afterDelete', async (technology) => {
				indexObject.deleteObject(technology.toJSON().objectID);
			});
		}
	}

	static get computed() {
		return ['objectID'];
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
}

module.exports = Technology;
