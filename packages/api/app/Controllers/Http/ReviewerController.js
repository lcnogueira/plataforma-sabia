const Reviewer = use('App/Models/Reviewer');
const User = use('App/Models/User');
const Term = use('App/Models/Term');

const { getTransaction } = require('../../Utils');

class ReviewerController {
	async syncronizeCategories(trx, categories, reviewer, detach = false) {
		if (detach) {
			await reviewer.categories().detach(null, null, trx);
		}
		const categoryInstances = await Promise.all(
			categories.map((category) => Term.getTerm(category)),
		);
		await reviewer.categories().attach(
			categoryInstances.map((category) => category.id),
			null,
			trx,
		);
	}

	async store({ request }) {
		const { user_id, categories } = request.only(['user_id', 'categories']);
		const user = await User.findOrFail(user_id);
		const reviewer = await Reviewer.create();
		reviewer.user().associate(user);
		let trx;
		try {
			const { init, commit } = getTransaction();
			trx = await init();

			await this.syncronizeCategories(trx, categories, reviewer);

			await commit();
		} catch (error) {
			trx.rollback();
			throw error;
		}
		await reviewer.loadMany(['user', 'categories']);
		return reviewer;
	}
}

module.exports = ReviewerController;
