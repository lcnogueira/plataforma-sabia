/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const User = use('App/Models/User');

const Config = use('Adonis/Src/Config');
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
	 * @param {string} scope scope
	 */
	async sendEmailConfirmation(request, user, scope) {
		const { adminURL, webURL } = Config.get('app');
		await user
			.tokens('type', 'confirm_ac')
			.where('is_revoked', false)
			.update({ is_revoked: true });

		const { token } = await user.generateToken('confirm-ac');

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.confirmAccountEmailSubject'),
			template: 'emails.confirm-account',
			user,
			token,
			url:
				scope === 'admin'
					? `${adminURL}/auth/confirm-account/`
					: `${webURL}?action=confirmAccount`,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });
	}

	async register({ request }) {
		const { scope, disclaimers } = request.only(['scope', 'disclaimers']);
		const data = request.only(['full_name', 'first_name', 'last_name', 'email', 'password']);

		const user = await User.create(data);
		await user.load('role');
		await user.accept(disclaimers);
		await this.sendEmailConfirmation(request, user, scope);

		return {
			...user.toJSON(),
			password: '',
		};
	}

	async confirmAccount({ request, response }) {
		const { token, scope } = request.only(['token', 'scope']);
		const { adminURL, webURL } = Config.get('app');

		const tokenObject = await Token.getTokenObjectFor(token, 'confirm-ac');

		if (!tokenObject) {
			return response
				.status(401)
				.send(errorPayload(errors.INVALID_TOKEN, request.antl('error.auth.invalidToken')));
		}

		await tokenObject.revoke();

		const user = await tokenObject.user().fetch();

		user.status = 'verified';
		await user.save();

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.accountActivatedEmailSubject'),
			template: 'emails.active-account',
			user,
			url: scope === 'admin' ? adminURL : webURL,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });

		return response.status(200).send({ success: true });
	}

	/**
	 * Register a confirmation e-mail.
	 *
	 * @param {Request} ctx.request The HTTP request
	 *
	 * @returns {Response}
	 */

	async resendConfirmationEmail({ request, response }) {
		const { email, scope } = request.only(['email', 'scope']);
		const user = await User.findBy('email', email);

		if (user.isVerified()) {
			return response.status(200).send({ success: true });
		}

		await this.sendEmailConfirmation(request, user, scope);

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
		const { email, scope } = request.all();

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
		const { adminURL, webURL } = Config.get('app');

		const mailData = {
			email: user.email,
			subject: request.antl('message.auth.passwordRecoveryEmailSubject'),
			template: 'emails.forgot-password',
			user,
			token,
			url:
				scope === 'admin'
					? `${adminURL}#/auth/reset-password`
					: `${webURL}/auth/reset-password`,
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
		const { token, password } = request.all();

		const tokenObject = await Token.getTokenObjectFor(token, 'reset-pw');

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
		const filters = request.all();

		const user = await auth.current.user;
		await user.load('role');

		if (!!filters.bookmarks || filters.bookmarks === '') {
			await user.load('bookmarks', (builder) => builder.select('id'));
		}

		return user;
	}
}

module.exports = AuthController;
