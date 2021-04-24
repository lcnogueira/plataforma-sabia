// const Model = require('@adonisjs/lucid/src/Lucid/Model');
const { saveIndex } = require('../Utils/Algolia');

class HandleAlgoliaObject {
	static get key() {
		return 'HandleAlgoliaObject-key';
	}

	async handle(job) {
		const { data } = job;

		const { index, model, id } = data;

		// if (model instanceof Model) {
		// }

		const objectData = (
			await model
				.query()
				.populateForAlgolia(id)
				.first()
		).toJSON();

		await saveIndex(index, objectData);
	}
}

module.exports = HandleAlgoliaObject;
