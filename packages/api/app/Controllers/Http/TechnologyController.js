/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Config = use('Adonis/Src/Config');
const Technology = use('App/Models/Technology');
const Term = use('App/Models/Term');
const Taxonomy = use('App/Models/Taxonomy');
const User = use('App/Models/User');
const Upload = use('App/Models/Upload');

const algoliasearch = use('App/Services/AlgoliaSearch');
const algoliaConfig = Config.get('algolia');
const indexObject = algoliasearch.initIndex(algoliaConfig.indexName);
const CATEGORY_TAXONOMY_SLUG = 'CATEGORY';

const Mail = use('Mail');

const { errors, errorPayload, getTransaction, roles } = require('../../Utils');

// get only useful fields
const getFields = (request) =>
	request.only([
		'title',
		'description',
		'private',
		'thumbnail_id',
		'patent',
		'patent_number',
		'primary_purpose',
		'secondary_purpose',
		'application_mode',
		'application_examples',
		'installation_time',
		'solves_problem',
		'entailes_problem',
		'requirements',
		'risks',
		'contribution',
		'status',
	]);

class TechnologyController {
	/**
	 * Show a list of all technologies.
	 * GET technologies?term=
	 */
	async index({ request }) {
		return Technology.query()
			.withParams(request.params)
			.withFilters(request)
			.fetch();
	}

	/**
	 * Get a single technology.
	 * GET technologies/:id
	 */
	async show({ request }) {
		return Technology.query()
			.getTechnology(request.params.id)
			.withParams(request.params)
			.withFilters(request)
			.firstOrFail();
	}

	/**
	 * Get technology terms.
	 * GET /technologies/:id/terms?taxonomy=
	 */
	async showTechnologyTerms({ request, params }) {
		const { id } = params;
		const query = request.get();
		const technology = await Technology.findOrFail(id);
		if (query.taxonomy) {
			const taxonomy = await Taxonomy.getTaxonomy(query.taxonomy);
			return Term.query()
				.whereHas('technologies', (builder) => {
					builder.where('id', technology.id);
				})
				.where('taxonomy_id', taxonomy.id)
				.withParams(request.params, { filterById: false })
				.fetch();
		}

		return Term.query()
			.whereHas('technologies', (builder) => {
				builder.where('id', technology.id);
			})
			.withParams(request.params, { filterById: false })
			.fetch();
	}

	/**
	 * Get technology users.
	 * GET /technologies/:id/users?role=
	 */
	async showTechnologyUsers({ request, params }) {
		const { id } = params;
		const query = request.get();
		const technology = await Technology.findOrFail(id);
		if (query.role) {
			return technology
				.users()
				.wherePivot('role', query.role)
				.fetch();
		}
		return technology.users().fetch();
	}

	/**
	 * Get technology reviews.
	 * GET /technologies/:id/review
	 */
	async showTechnologyReviews({ params, request }) {
		const { id } = params;
		const { orderBy = 'id', order = 'asc' } = request.all();

		const technology = await Technology.findOrFail(id);

		return technology
			.reviews()
			.withParams(request.params, { filterById: false })
			.orderBy(orderBy, order)
			.fetch();
	}

	/**
	 * Delete a technology with id.
	 * DELETE technologies/:id
	 */
	async destroy({ params, request, response }) {
		const technology = await Technology.findOrFail(params.id);
		// detaches related entities
		await Promise.all([technology.users().detach(), technology.terms().detach()]);
		const result = await technology.delete();
		if (!result) {
			return response
				.status(400)
				.send(
					errorPayload(
						errors.RESOURCE_DELETED_ERROR,
						request.antl('error.resource.resourceDeletedError'),
					),
				);
		}

		return response.status(200).send({ success: true });
	}

	/**
	 * Delete a technology term.
	 * DELETE technologies/:id/terms/:term
	 */
	async deleteTechnologyTerm({ params, response }) {
		const { id, term } = params;
		const [technology, termObj] = await Promise.all([
			Technology.findOrFail(id),
			Term.getTerm(term),
		]);
		await technology.terms().detach([termObj.id]);
		return response.status(200).send({ success: true });
	}

	/**
	 * Delete a technology user.
	 * DELETE technologies/:id/users/:idUser
	 */
	async deleteTechnologyUser({ params, response }) {
		const { id, idUser } = params;
		const [technology, user] = await Promise.all([
			Technology.findOrFail(id),
			User.findOrFail(idUser),
		]);
		await technology.users().detach([user.id]);
		return response.status(200).send({ success: true });
	}

	async syncronizeUsers(trx, users, technology, detach = false, provisionUser = false) {
		if (detach) {
			await technology.users().detach(null, null, trx);
		}

		const usersToFind = [];
		let resultUsers = [];
		users.forEach((user) => {
			if (user.id) {
				resultUsers.push(user);
			} else {
				usersToFind.push(User.invite(user, provisionUser));
			}
		});

		// Returns the users found in the db, the provisioned ones and null (in case the user was not found and not provisioned)
		const foundUsers = await Promise.all(usersToFind);
		resultUsers = [...resultUsers, ...foundUsers.filter(Boolean)];

		const usersMap = resultUsers.reduce(
			(obj, currentUser) => {
				const { id, role } = currentUser;
				obj.ids.push(id);
				obj.users[id] = typeof role === 'string' ? role : 'DEFAULT_USER';
				return obj;
			},
			{ ids: [], users: {} },
		);

		await technology.users().attach(
			usersMap.ids,
			(row) => {
				// eslint-disable-next-line no-param-reassign
				row.role = usersMap.users[row.user_id];
			},
			trx,
		);

		return resultUsers;
	}

	async syncronizeTerms(trx, terms, technology, detach = false) {
		if (detach) {
			await technology.terms().detach(null, null, trx);
		}
		const termInstances = await Promise.all(terms.map((term) => Term.getTerm(term)));
		await technology.terms().attach(
			termInstances.map((term) => term.id),
			null,
			trx,
		);
	}

	indexToAlgolia(technologyData) {
		const defaultCategory = 'Não definida';
		const technologyForAlgolia = { ...technologyData.toJSON(), category: defaultCategory };

		if (technologyForAlgolia.terms) {
			const termsObj = technologyForAlgolia.terms.reduce((acc, obj) => {
				acc[obj.taxonomy.taxonomy] = obj.term;
				return acc;
			}, {});
			technologyForAlgolia.category = termsObj[CATEGORY_TAXONOMY_SLUG] || defaultCategory;

			delete technologyForAlgolia.terms;
		}

		indexObject.saveObject(technologyForAlgolia);
	}

	/**
	 * Create/save a new technology.
	 * If terms is provided, it adds the related terms
	 * If users is provided, it adds the related users
	 */
	async store({ auth, request }) {
		const { thumbnail_id, ...data } = getFields(request);

		let technology;
		let trx;

		try {
			const { init, commit } = getTransaction();
			trx = await init();
			const user = await auth.getUser();

			technology = await Technology.create(data, trx);

			if (thumbnail_id) {
				const thumbnail = await Upload.findOrFail(thumbnail_id);
				await technology.thumbnail().associate(thumbnail, trx);
			} else {
				technology.thumbnail_id = null;
			}

			let { users } = request.only(['users']);

			// if users arent supplied, defaults to the logged in user.
			if (!users) {
				users = [{ ...user.toJSON(), role: roles.OWNER }];
			}

			await this.syncronizeUsers(trx, users, technology);

			const { terms } = request.only(['terms']);
			if (terms) {
				await this.syncronizeTerms(trx, terms, technology);
			}

			await commit();
			await technology.loadMany(['users', 'terms.taxonomy']);
		} catch (error) {
			await trx.rollback();
			throw error;
		}
		technology.likes = 0;
		this.indexToAlgolia(technology);

		return technology;
	}

	/**
	 * Send invitation emails to the users that have been just syncronized.
	 *
	 * @param {Array} users The users who have been just associated to the technology
	 * @param {object} title The title of the technology
	 * @param {Function} antl Function to translate the messages
	 */
	async sendInvitationEmails(users, title, antl) {
		const { from } = Config.get('mail');
		const { webURL } = Config.get('app');

		const emailMessages = [];
		users.forEach(async (user) => {
			const { token } = user.isInvited()
				? await user.generateToken('reset-pw')
				: { token: null };

			emailMessages.push(
				Mail.send(
					'emails.technology-invitation',
					{
						user,
						token,
						title,
						url: `${webURL}/auth/reset-password`,
					},
					(message) => {
						message.subject(antl('message.user.invitationEmailSubject'));
						message.from(from);
						message.to(user.email);
					},
				),
			);
		});

		try {
			await Promise.all(emailMessages);
		} catch (exception) {
			// eslint-disable-next-line no-console
			console.error(exception);
		}
	}

	/** POST technologies/:idTechnology/users */
	async associateTechnologyUser({ params, request }) {
		const { users } = request.only(['users']);
		const { id } = params;
		const technology = await Technology.findOrFail(id);
		const currentUsers = (await technology.users().fetch()).toJSON();

		let trx;
		let sincronizedUsers = [];

		try {
			const { init, commit } = getTransaction();
			trx = await init();

			sincronizedUsers = await this.syncronizeUsers(trx, users, technology, false, true);

			await commit();
		} catch (error) {
			trx.rollback();
			throw error;
		}

		// only send invitation emails for newly-added users
		const usersToSendInvitationEmail = sincronizedUsers.filter((syncronizedUser) => {
			return !currentUsers.find((user) => user.id === syncronizedUser.id);
		});

		if (usersToSendInvitationEmail.length > 0) {
			await this.sendInvitationEmails(
				usersToSendInvitationEmail,
				technology.title,
				request.antl,
			);
		}

		return technology.users().fetch();
	}

	/** POST technologies/:id/terms */
	async associateTechnologyTerm({ params, request }) {
		const { id } = params;
		const technology = await Technology.findOrFail(id);
		const { terms } = request.only(['terms']);
		let trx;
		try {
			const { init, commit } = getTransaction();
			trx = await init();

			await this.syncronizeTerms(trx, terms, technology);

			await commit();
		} catch (error) {
			trx.rollback();
			throw error;
		}
		return technology.terms().fetch();
	}

	/**
	 * Update technology details.
	 * PUT or PATCH technologies/:id
	 * If terms are provided, the related terms are updated
	 * If users are provided, the related users are updated
	 */
	async update({ params, request }) {
		const technology = await Technology.findOrFail(params.id);
		const { thumbnail_id, ...data } = getFields(request);
		technology.merge(data);

		let trx;

		try {
			const { init, commit } = getTransaction();
			trx = await init();

			await technology.save(trx);

			if (thumbnail_id) {
				const thumbnail = await Upload.findOrFail(thumbnail_id);
				await technology.thumbnail().associate(thumbnail, trx);
			}

			const { users } = request.only(['users']);
			if (users) {
				await this.syncronizeUsers(trx, users, technology, true);
			}

			const { terms } = request.only(['terms']);
			if (terms) {
				await this.syncronizeTerms(trx, terms, technology, true);
			}

			await commit();

			await technology.loadMany(['users', 'terms.taxonomy', 'terms.metas']);
		} catch (error) {
			await trx.rollback();
			throw error;
		}

		this.indexToAlgolia(technology);

		return technology;
	}
}

module.exports = TechnologyController;
