/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Database = use('Database');

class HandleParam {
	/** JSDoc Block
	 *
	 * @param {object} ctx The content of the request
	 * @param {Request} ctx.request The HTTP request
	 * @param {Function} next next
	 */
	async handle({ request, response }, next) {
		const data = request.only(['page', 'perPage', 'order', 'orderBy', 'embed', 'ids', 'notIn']);

		if (data.embed === '') {
			data.embed = {
				all: true,
				ids: false,
			};
		} else if (data.embed === 'ids') {
			data.embed = {
				all: false,
				ids: true,
			};
		}

		const defaultEmbed = false;
		const embed = data.embed ? data.embed : defaultEmbed;

		if (request.params.id) {
			request.params = {
				...request.params,
				embed,
			};
			return next();
		}

		const maxPerPage = 100;
		const defaultPerPage = 10;
		const defaultPage = 1;

		data.order = data.order ? data.order.toLowerCase() : '';
		data.orderBy = data.orderBy ? data.orderBy.toLowerCase() : '';
		data.perPage = data.perPage > 0 ? data.perPage : defaultPerPage;
		data.perPage = data.perPage > maxPerPage ? maxPerPage : data.perPage;
		data.page = data.page > 0 ? data.page : defaultPage;

		const get_resource = request.url().split('/')[1];
		const resource = get_resource;

		const count = await Database.from(resource).count();
		const total = count[0]['count(*)'];
		const totalPages = Math.ceil(total / data.perPage);

		const order = ['asc', 'desc'];
		const orderBy = {
			technologies: ['id', 'title', 'slug', 'likes'],
			roles: ['id', 'role', 'created_at', 'updated_at'],
			users: ['id', 'first_name', 'last_name', 'email', 'created_at', 'updated_at'],
			taxonomies: ['id', 'taxonomy', 'created_at', 'updated_at'],
			terms: ['id', 'term', 'slug', 'created_at', 'updated_at'],
			permissions: ['id', 'permission', 'created_at', 'updated_at'],
			technology_reviews: ['id', 'content', 'rating', 'created_at', 'updated_at'],
			user_bookmarks: ['user_id', 'technology_id'],
			technology_costs: ['id', 'funding_required', 'funding_type'],
			costs: ['id', 'cost_type', 'description'],
			uploads: ['id', 'filename', 'created_at', 'updated_at'],
		};

		data.ids = data.ids ? data.ids.split(',').filter((id) => id > 0) : [];
		data.notIn = data.notIn ? data.notIn.split(',').filter((id) => id > 0) : [];

		const defaultListIds = false;

		const params = {
			...request.params,
			page: data.page > totalPages && totalPages > 0 ? totalPages : data.page,
			perPage: data.perPage,
			order: order.includes(data.order) ? data.order : order[0],
			orderBy: orderBy[resource].includes(data.orderBy) ? data.orderBy : 'id',
			embed,
			id: false,
			ids: data.ids.length ? data.ids : defaultListIds,
			notIn: data.notIn.length ? data.notIn : defaultListIds,
		};

		request.params = params;
		response.header('X-Sabia-Total', total);
		response.header('X-Sabia-TotalPages', totalPages);

		return next();
	}
}

module.exports = HandleParam;
