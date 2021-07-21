class Params {
	register(Model) {
		const relationships = {
			technologies: [
				'users',
				'terms',
				'reviews',
				'bookmarkUsers',
				'costs',
				'thumbnail',
				'reviewers',
				'revisions',
				'knowledgeArea',
				'keywords',
				'locations',
			],
			roles: ['permissions', 'users'],
			users: [
				'tokens',
				'role',
				'permissions',
				'technologies',
				'reviews',
				'technologyBookmarks',
				'serviceBookmarks',
				'uploads',
				'disclaimers',
				'institution',
				'announcements',
				'messages',
				'ideas',
				'orders',
				'services',
				'serviceOrders',
				'serviceOrderReviews',
				'areas',
				'deviceTokens',
				'city',
				'state',
			],
			taxonomies: ['terms'],
			terms: ['taxonomy', 'technologies', 'metas', 'announcements'],
			permissions: ['roles', 'users'],
			technology_reviews: ['technology', 'user'],
			user_bookmarks: ['technology', 'user'],
			service_bookmarks: ['service', 'user'],
			technology_costs: ['technology', 'costs'],
			costs: ['technologyCost'],
			uploads: ['user'],
			reviewers: ['user', 'technologies', 'revisions'],
			revisions: ['reviewer', 'technology', 'attachment'],
			disclaimers: [],
			technology_comments: ['technology', 'user'],
			technology_questions: ['technology', 'user'],
			institution: ['users', 'announcements'],
			technology_orders: ['technology', 'user'],
			knowledge_areas: ['greatArea', 'area', 'subArea', 'speciality'],
			announcements: ['user', 'institution', 'terms'],
			institutions: ['users', 'logo'],
			messages: ['user'],
			ideas: ['user', 'terms'],
			services: ['user', 'keywords', 'thumbnail'],
			service_orders: ['service', 'user', 'serviceOrderReviews'],
			service_order_reviews: ['serviceOrder', 'user'],
			reviewer_technology_history: ['reviewer', 'technology'],
			locations: ['city'],
		};
		const listOrder = ['asc', 'desc'];
		const listOrderBy = {
			technologies: ['id', 'title', 'slug', 'likes', 'created_at'],
			roles: ['id', 'role', 'created_at', 'updated_at'],
			users: [
				'id',
				'first_name',
				'last_name',
				'email',
				'created_at',
				'updated_at',
				'institution_id',
				'status',
				'role_id',
			],
			taxonomies: ['id', 'taxonomy', 'created_at', 'updated_at'],
			terms: ['id', 'term', 'slug', 'created_at', 'updated_at'],
			permissions: ['id', 'permission', 'created_at', 'updated_at'],
			technology_reviews: ['id', 'content', 'rating', 'created_at', 'updated_at'],
			user_bookmarks: ['user_id', 'technology_id'],
			service_bookmarks: ['user_id', 'service_id'],
			technology_costs: ['id', 'funding_required', 'funding_type'],
			costs: ['id', 'cost_type', 'description'],
			uploads: ['id', 'filename', 'created_at', 'updated_at'],
			reviewers: ['id', 'user_id', 'status', 'created_at', 'updated_at'],
			revisions: [
				'id',
				'description',
				'assessment',
				'reviewer_id',
				'technology_id',
				'created_at',
				'updated_at',
			],
			disclaimers: ['id', 'description', 'required', 'type', 'version'],
			technology_comments: ['id', 'comment', 'created_at', 'updated_at'],
			technology_questions: [
				'id',
				'question',
				'answer',
				'status',
				'created_at',
				'updated_at',
			],
			institutions: [
				'id',
				'name',
				'initials',
				'cnpj',
				'address',
				'district',
				'zipcode',
				'city',
				'state',
				'created_at',
				'updated_at',
				'type',
				'category',
			],
			technology_orders: [
				'id',
				'status',
				'unit_value',
				'user_id',
				'created_at',
				'updated_at',
			],
			knowledge_areas: [
				'knowledge_area_id',
				'level',
				'name',
				'great_area_id',
				'area_id',
				'sub_area_id',
				'speciality_id',
			],
			announcements: [
				'id',
				'announcement_number',
				'title',
				'description',
				'start_date',
				'end_date',
				'created_at',
				'updated_at',
			],
			messages: ['id', 'user_id', 'subject', 'content', 'created_at', 'updated_at'],
			ideas: ['id', 'title', 'description', 'user_id', 'created_at', 'updated_at'],
			services: [
				'id',
				'name',
				'description',
				'type',
				'measure_unit',
				'user_id',
				'created_at',
				'updated_at',
			],
			service_orders: [
				'id',
				'user_id',
				'service_id',
				'quantity',
				'status',
				'created_at',
				'updated_at',
			],
			service_order_reviews: [
				'user_id',
				'service_order_id',
				'id',
				'content',
				'rating',
				'created_at',
				'updated_at',
			],
			reviewer_technology_history: [
				'id',
				'technology_id',
				'reviewer_id',
				'status',
				'created_at',
				'updated_at',
			],
			locations: [
				'id',
				'place_id',
				'address',
				'city_id',
				'lat',
				'lng',
				'created_at',
				'updated_at',
			],
		};

		Model.queryMacro('withParams', async function withParams(request, options = {}) {
			const {
				id,
				embed,
				page,
				perPage,
				order,
				orderBy,
				ids,
				notIn,
				filterBy,
				filter,
			} = request.params;

			// eslint-disable-next-line no-underscore-dangle
			const resource = this._single.table;

			const { filterById = true, skipRelationships = [], skipPagination = false } = options;

			if (filterBy && filter) {
				this.where(filterBy, 'LIKE', `%${filter}%`);
			}

			if (embed.all) {
				relationships[resource].map(
					(model) => !skipRelationships.includes(model) && this.with(model),
				);
			} else if (embed.ids) {
				relationships[resource].map((model) =>
					this.with(model, (builder) => builder.select('id')),
				);
			}

			const isIdInteger = Number.isInteger(Number(id));
			if (id && isIdInteger && filterById) {
				this.where({ id });
			} else if (typeof id === 'undefined' || id === false || !filterById) {
				if (ids) {
					this.whereIn('id', ids);
				}
				if (notIn) {
					this.whereNotIn('id', notIn);
				}
				this.orderBy(
					listOrderBy[resource].includes(orderBy) ? orderBy : 'id',
					listOrder.includes(order) ? order : listOrder[0],
				);

				const countQuery = await this.clone().count('* as total');

				const { total } = countQuery[0];

				let totalPages = 1;
				if (!skipPagination) {
					totalPages = Math.ceil(total / perPage);

					this.offset((page - 1) * perPage).limit(perPage);
				}

				request.params = {
					...request.params,
					total,
					totalPages,
				};
				return this.fetch();
			}

			return this.firstOrFail();
		});

		Model.queryMacro('withAssociations', function withAssociations(id) {
			return this.withParams({
				params: { id, ids: false, embed: { all: true, ids: false } },
			});
		});
	}
}
module.exports = Params;
