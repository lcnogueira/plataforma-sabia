const User = use('App/Models/User');
const Role = use('App/Models/Role');
const Permission = use('App/Models/Permission');
const Token = use('App/Models/Token');
const Institution = use('App/Models/Institution');
const City = use('App/Models/City');
const State = use('App/Models/State');
const KnowledgeArea = use('App/Models/KnowledgeArea');
const { errors, errorPayload, getTransaction } = require('../../Utils');
// get only useful fields
const getFields = (request) =>
	request.only([
		'first_name',
		'last_name',
		'email',
		'password',
		'company',
		'zipcode',
		'cpf',
		'birth_date',
		'phone_number',
		'lattes_id',
		'address',
		'address2',
		'district',
		'city_id',
		'state_id',
		'country',
		'permissions',
		'status',
		'role',
		'full_name',
		'institution_id',
		'researcher',
		'areas',
	]);

const Bull = use('Rocketseat/Bull');
const SendMailJob = use('App/Jobs/SendMail');

const Hash = use('Hash');

class UserController {
	/**
	 * Show a list of all users.
	 * GET users
	 */
	async index({ request }) {
		const filters = request.all();

		return User.query()
			.with('permissions', (builder) => builder.select('id'))
			.withResearcherFilters(filters)
			.withParams(request);
	}

	/**
	 * Create/save a new user.
	 * POST users
	 */
	async store({ request }) {
		const { permissions, institution_id, city_id, state_id, areas, ...data } = getFields(
			request,
		);

		const user = await User.create(data);

		if (permissions) {
			await user.permissions().detach();
			await user.permissions().attach(permissions);
		}
		if (institution_id) {
			const institutionInst = await Institution.findOrFail(institution_id);
			await user.institution().associate(institutionInst);
		}
		if (city_id) {
			const cityInst = await City.findOrFail(city_id);
			await user.city().associate(cityInst);
		}
		if (state_id) {
			const stateInst = await State.findOrFail(state_id);
			await user.state().associate(stateInst);
		}
		if (areas) {
			const areasCollection = await KnowledgeArea.query()
				.whereIn('knowledge_area_id', areas)
				.fetch();
			const areasIds = areasCollection.rows.map((area) => area.knowledge_area_id);
			await user.areas().attach(areasIds);
		}

		return User.query().withAssociations(user.id);
	}

	/**
	 * Get a single user.
	 * GET users/:id
	 */
	async show({ request }) {
		return User.query()
			.with('permissions', (builder) => builder.select('id'))
			.withParams(request);
	}

	/**
	 * Update user details.
	 * PUT or PATCH users/:id
	 */
	async update({ auth, params, request }) {
		const { id } = params;
		const {
			permissions,
			status,
			role,
			institution_id,
			city_id,
			state_id,
			areas,
			...data
		} = getFields(request);
		if (status) data.status = status;

		const upUser = await User.findOrFail(id);

		if (institution_id) {
			const institutionInst = await Institution.findOrFail(institution_id);
			await upUser.institution().associate(institutionInst);
		}
		if (city_id) {
			const cityInst = await City.findOrFail(city_id);
			await upUser.city().associate(cityInst);
		}
		if (state_id) {
			const stateInst = await State.findOrFail(state_id);
			await upUser.state().associate(stateInst);
		}
		if (areas) {
			await upUser.areas().detach();
			const areasCollection = await KnowledgeArea.query()
				.whereIn('knowledge_area_id', areas)
				.fetch();
			const areasIds = areasCollection.rows.map((area) => area.knowledge_area_id);
			await upUser.areas().attach(areasIds);
		}

		// Verify if user has permission
		const loggedUser = await auth.getUser();
		const canUpdateUsers = await Permission.checkPermission(
			loggedUser,
			['update-users'],
			params,
		);
		if (canUpdateUsers) {
			if (role) {
				const newUserRole = await Role.getRole(role);
				if (upUser.role_id !== newUserRole.id) {
					await upUser.role().dissociate();
					await upUser.role().associate(newUserRole);
				}
			}

			if (permissions) {
				await upUser.permissions().detach();
				await upUser.permissions().attach(permissions);
			}
			if (status) {
				data.status = status;
			}
		} else {
			data.status = upUser.status;
			data.email = upUser.email;
		}

		upUser.merge(data);
		await upUser.save();

		return User.query().withAssociations(upUser.id);
	}

	/** POST users/:id/permissions */
	async associatePermissionUser({ params, request }) {
		const { permissions } = request.only(['permissions']);
		const { id } = params;

		const user = await User.findOrFail(id);
		const permissionCollection = await Permission.query()
			.whereIn('permission', permissions)
			.fetch();
		const permissionsIds = permissionCollection.rows.map((permission) => permission.id);
		await user.permissions().attach(permissionsIds);
		return User.query().withAssociations(user.id);
	}

	/**
	 * Delete a user with id.
	 * DELETE users/:id
	 */
	async destroy({ params, request, response }) {
		const { id } = params;
		const user = await User.findOrFail(id);
		const result = await user.delete();
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
	 * Delete many users with array of id.
	 * DELETE users?ids=0,0,0
	 */
	async destroyMany({ request, response }) {
		const { ids } = request.params;

		const result = await User.query()
			.whereIn('id', ids)
			.delete();

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

	async changePassword({ auth, request, response }) {
		const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword']);
		const user = await auth.getUser();

		const verifyPassword = await Hash.verify(currentPassword, user.password);
		if (!verifyPassword) {
			return response
				.status(400)
				.send(
					errorPayload(
						errors.PASSWORD_NOT_MATCH,
						request.antl('error.user.passwordDoNotMatch'),
					),
				);
		}
		user.password = newPassword;
		await user.save();
		// Send Email
		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.passwordChangedEmailSubject'),
			template: 'emails.reset-password',
			user,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}

	async changeEmail({ auth, request, response }) {
		const { email } = request.only(['email']);
		const user = await auth.getUser();
		user.temp_email = email;
		await user.save();
		// Send Email

		await user
			.tokens('type', 'new-email')
			.where('is_revoked', false)
			.update({ is_revoked: true });

		const { token } = await user.generateToken('new-email');

		const mailData = {
			email: user.temp_email,
			subject: request.antl('message.auth.confirmNewEmailSubject'),
			template: 'emails.new-email-verification',
			user,
			token,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}

	async confirmNewEmail({ request, response }) {
		const { email, token } = request.only(['email', 'token']);

		const tokenObject = await Token.getTokenObjectFor(email, token, 'new-email');

		if (!tokenObject) {
			return response
				.status(401)
				.send(errorPayload(errors.INVALID_TOKEN, request.antl('error.auth.invalidToken')));
		}

		await tokenObject.revoke();

		const user = await tokenObject.user().fetch();
		let trx;

		try {
			const { init, commit } = getTransaction();
			trx = await init();

			user.email = user.temp_email;
			user.temp_email = null;
			await user.save(trx);

			await commit();
		} catch (error) {
			await trx.rollback();
			throw error;
		}

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.sucessChangeEmailSubject'),
			template: 'emails.sucess-change-email',
			user,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}
}

module.exports = UserController;
