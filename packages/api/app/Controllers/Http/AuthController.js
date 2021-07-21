/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const User = use('App/Models/User');

const Token = use('App/Models/Token');
const Bull = use('Rocketseat/Bull');
const SendMailJob = use('App/Jobs/SendMail');

const { errors, errorPayload } = require('../../Utils');

class AuthController {
	/**
	 * Register an user.
	 *
	 * @param {Request} request The HTTP request
	 * @param {object} user user
	 */
	async sendEmailConfirmation(request, user) {
		await user
			.tokens('type', 'confirm_ac')
			.where('is_revoked', false)
			.update({ is_revoked: true });

		const { token } = await user.generateToken('confirm-ac');

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.confirmAccountEmailSubject'),
			template: 'emails.confirm-account',
			token,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });
	}

	async register({ request }) {
		const { disclaimers } = request.only(['disclaimers']);
		const data = request.only(['email', 'password']);

		const user = await User.create(data);
		await user.load('role');
		await user.accept(disclaimers);
		await this.sendEmailConfirmation(request, user);

		return {
			...user.toJSON(),
			password: '',
		};
	}

	async confirmAccount({ auth, request, response }) {
		const { email, token } = request.only(['email', 'token']);

		const tokenObject = await Token.getTokenObjectFor(email, token, 'confirm-ac');

		if (!tokenObject) {
			return response
				.status(401)
				.send(errorPayload(errors.INVALID_TOKEN, request.antl('error.auth.invalidToken')));
		}

		await tokenObject.revoke();

		const user = await tokenObject.user().fetch();

		user.status = 'verified';
		await user.save();

		return auth.generate(user);
	}

	/**
	 * Register a confirmation e-mail.
	 *
	 * @param {Request} ctx.request The HTTP request
	 *
	 * @returns {Response}
	 */

	async resendConfirmationEmail({ request, response }) {
		const { email } = request.only(['email']);
		const user = await User.findBy('email', email);

		if (user.isVerified()) {
			return response.status(200).send({ success: true });
		}

		await this.sendEmailConfirmation(request, user);

		return response.status(200).send({ success: true });
	}

	/**
	 * Authenticate an user.
	 *
	 * @param {object} ctx The content of the request
	 * @param {Request} ctx.request The HTTP request
	 * @param {object} ctx.auth The Auth object.
	 *
	 * @returns {Response}
	 */
	async auth({ request, auth, response }) {
		const { email, password } = request.only(['email', 'password']);

		const user = await User.findBy('email', email);
		if (user && (user.isPending() || user.isInvited())) {
			return response
				.status(401)
				.send(
					errorPayload(
						errors.UNVERIFIED_EMAIL,
						request.antl('error.auth.unverifiedEmail'),
					),
				);
		}

		const token = await auth.attempt(email, password);
		return token;
	}

	/**
	 * Method to handle restting passwords.
	 *
	 * @param {object} ctx The content of the request
	 * @param {Request} ctx.request The HTTP request
	 * @param {object} ctx.auth The Auth object.
	 *
	 * @returns {Response}
	 */
	async forgotPassword({ request, response }) {
		const { email } = request.all();

		const user = await User.findBy('email', email);

		if (!user) {
			return response
				.status(400)
				.send(errorPayload(errors.INVALID_EMAIL, request.antl('error.email.invalid')));
		}

		await user
			.tokens('type', 'reset-pw')
			.where('is_revoked', false)
			.update({ is_revoked: true });

		const { token } = await user.generateToken('reset-pw');

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.passwordRecoveryEmailSubject'),
			template: 'emails.forgot-password',
			user,
			token,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}

	/**
	 * Resets a password through a token
	 *
	 * @param {object} ctx The content of the request
	 * @param {Request} ctx.request The HTTP request
	 * @param {object} ctx.auth The Auth object.
	 *
	 * @returns {Response}
	 */
	async resetPassword({ request, response }) {
		const { email, token, password } = request.all();

		const tokenObject = await Token.getTokenObjectFor(email, token, 'reset-pw');

		if (!tokenObject) {
			return response
				.status(401)
				.send(errorPayload(errors.INVALID_TOKEN, request.antl('error.auth.invalidToken')));
		}

		await tokenObject.revoke();

		const user = await tokenObject.user().fetch();
		user.merge({ password, status: 'verified' });
		await user.save();

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.passwordChangedEmailSubject'),
			template: 'emails.reset-password',
			user,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}

	/**
	 * Returns the current logged in user.
	 *
	 * @param {object} ctx The content of the request
	 * @param {Request} ctx.request The HTTP request
	 * @param {object} ctx.auth The Auth object.
	 *
	 * @returns {Response}
	 */
	async getMe({ auth, request }) {
		const user = await auth.current.user;
		const filters = request.all();

		const loadIfRequested = async (
			relationships,
			condition = () => {},
			customParamName = null,
		) => {
			const relationshipsToLoad = [];

			if (typeof relationships === 'string') {
				relationshipsToLoad.push(relationships);
			} else if (Array.isArray(relationships)) {
				relationshipsToLoad.push(...relationships);
			}

			for await (const relationship of relationshipsToLoad) {
				if (request.has(filters, customParamName || relationship)) {
					await user.load(relationship, condition);
				}
			}
		};

		await Promise.all([
			loadIfRequested(
				['technologyBookmarks', 'serviceBookmarks'],
				(builder) => builder.select('id'),
				'bookmarks',
			),
			loadIfRequested('orders', (builder) => builder.with('technology.users')),
			loadIfRequested('areas'),
			loadIfRequested('institution'),
			user.load('role'),
		]);

		const operations = await user.getOperations();

		return { ...user.toJSON(), operations };
	}
}

module.exports = AuthController;
