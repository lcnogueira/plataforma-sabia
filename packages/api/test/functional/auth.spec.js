const { test, trait } = use('Test/Suite')('Auth');
const User = use('App/Models/User');
const Bull = use('Rocketseat/Bull');
const dayjs = require('dayjs');
const { antl, errors, errorPayload } = require('../../app/Utils');
const { createUser } = require('../utils/Suts');

const Config = use('Config');
const { ttl } = Config.get('app.token');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const disclaimers = Array.from(Array(30).keys());

const userData = {
	email: 'sabiatestingemail@gmail.com',
	password: '123123',
	first_name: 'FirstName',
	last_name: 'LastName',
};

test('/auth/login endpoint works', async ({ client, assert }) => {
	const { userJson } = await createUser({ append: { status: 'verified' } });

	const response = await client
		.post('/auth/login')
		.send(userJson)
		.end();

	response.assertStatus(200);
	response.assertJSONSubset({
		type: 'bearer',
	});
	assert.exists(response.body.token);
});

test('/auth/login endpoint fails when user is pending', async ({ client }) => {
	const { userJson } = await createUser();

	const response = await client
		.post('/auth/login')
		.send(userJson)
		.end();

	response.assertStatus(401);
	response.assertJSONSubset(
		errorPayload(errors.UNVERIFIED_EMAIL, antl('error.auth.unverifiedEmail')),
	);
});

test('/auth/login endpoint fails when sending invalid payload', async ({ client }) => {
	const response = await client
		.post('/auth/login')
		.send({})
		.end();

	response.assertStatus(400);
	response.assertJSONSubset({
		error: { error_code: 'VALIDATION_ERROR' },
	});
});

test('/auth/login endpoint fails with email that does not exist', async ({ client }) => {
	const response = await client
		.post('/auth/login')
		.send({ email: 'any@mail.com', password: 'anypassword' })
		.end();

	response.assertStatus(401);
	response.assertJSONSubset(
		errorPayload(errors.INVALID_CREDENTIALS, antl('error.auth.invalidCredentials')),
	);
});

test('/auth/login endpoint fails with wrong password', async ({ client }) => {
	const { userJson } = await createUser({ append: { status: 'verified' } });

	const response = await client
		.post('/auth/login')
		.send({
			...userJson,
			password: 'wrongpassword',
		})
		.end();

	response.assertStatus(401);
	response.assertJSONSubset(
		errorPayload(errors.INVALID_CREDENTIALS, antl('error.auth.invalidCredentials')),
	);
});

test('/auth/register endpoint fails when sending invalid payload', async ({ client }) => {
	let response = await client
		.post('/auth/register')
		.header('Accept', 'application/json')
		.send({
			email: 'invalidemail',
		})
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload('VALIDATION_ERROR', [
			{
				field: 'email',
				validation: 'email',
			},
			{
				field: 'password',
				validation: 'required',
			},
		]),
	);

	response = await client
		.post('/auth/register')
		.header('Accept', 'application/json')
		.send({
			email: 'validemail@gmail.com',
		})
		.end();

	response.assertStatus(400);
	response.assertJSONSubset(
		errorPayload('VALIDATION_ERROR', [
			{
				field: 'password',
				validation: 'required',
			},
		]),
	);
});

test('/auth/register endpoint works', async ({ client, assert }) => {
	await Bull.reset();

	const response = await client
		.post('/auth/register')
		.header('Accept', 'application/json')
		.send({ ...userData, disclaimers })
		.end();

	const dbUser = await User.find(response.body.id);
	const bullCall = Bull.spy.calls[0];

	response.assertStatus(200);
	assert.exists(response.body.email);
	assert.exists(response.body.password);
	assert.exists(response.body.id);
	assert.isObject(response.body.role);
	assert.equal(response.body.role.role, 'DEFAULT_USER');
	assert.equal(dbUser.email, userData.email);
	assert.equal('add', bullCall.funcName);
	assert.equal(userData.email, bullCall.args[1].email);
	assert.equal('emails.confirm-account', bullCall.args[1].template);
	assert.isTrue(Bull.spy.called);
});

test('/auth/register and /auth/login endpoints works together', async ({ client, assert }) => {
	const registerResponse = await client
		.post('/auth/register')
		.send({ ...userData, disclaimers })
		.end();

	registerResponse.assertStatus(200);

	let loginResponse = await client
		.post('/auth/login')
		.send(userData)
		.end();

	loginResponse.assertStatus(401);
	loginResponse.assertJSONSubset(
		errorPayload(errors.UNVERIFIED_EMAIL, antl('error.auth.unverifiedEmail')),
	);

	const dbUser = await User.find(registerResponse.body.id);
	dbUser.status = 'verified';
	await dbUser.save();

	loginResponse = await client
		.post('/auth/login')
		.send(userData)
		.end();

	loginResponse.assertStatus(200);
	loginResponse.assertJSONSubset({
		type: 'bearer',
	});

	assert.exists(loginResponse.body.token);
});

test('/auth/register user register flow', async ({ client, assert }) => {
	const { email, password, first_name, last_name } = userData;
	// Register
	const registerResponse = await client
		.post('/auth/register')
		.send({ email, password, disclaimers })
		.end();

	registerResponse.assertStatus(200);
	const user = await User.findOrFail(registerResponse.body.id);

	// Confirms account by token
	const { token } = await user.generateToken('confirm-ac');
	const confirmAcResponse = await client
		.post('/auth/confirm-account')
		.send({ email: user.email, token })
		.end();
	confirmAcResponse.assertStatus(200);
	assert.exists(confirmAcResponse.body.token);

	// Complete user register
	const updateUserResponse = await client
		.put(`users/${user.id}`)
		.loginVia(user, 'jwt')
		.send({ first_name, last_name })
		.end();

	updateUserResponse.assertStatus(200);
	assert.equal(updateUserResponse.body.first_name, first_name);
	assert.equal(updateUserResponse.body.last_name, last_name);
});

test('/auth/forgot-password', async ({ client, assert }) => {
	await Bull.reset();

	const { user } = await createUser();
	let tokens = await user.tokens().fetch();

	assert.empty(tokens.toJSON());

	const forgotPasswordResponse = await client
		.get('/auth/forgot-password')
		.send({
			email: user.email,
		})
		.end();

	forgotPasswordResponse.assertStatus(200);
	forgotPasswordResponse.assertJSONSubset({ success: true });

	// test a token was created.
	tokens = await user.tokens().fetch();
	const bullCall = Bull.spy.calls[0];

	assert.equal(tokens.toJSON().length, 1);
	assert.equal('add', bullCall.funcName);
	assert.equal(user.email, bullCall.args[1].email);
	assert.equal('emails.forgot-password', bullCall.args[1].template);
	assert.isTrue(Bull.spy.called);
});

test('/auth/forgot-password with invalid email fails', async ({ client }) => {
	const forgotPasswordResponse = await client
		.get('/auth/forgot-password')
		.send({
			email: 'emailthatdontexist@gmail.com',
		})
		.end();

	forgotPasswordResponse.assertStatus(400);
	forgotPasswordResponse.assertJSONSubset(
		errorPayload(errors.INVALID_EMAIL, antl('error.email.invalid')),
	);
});

test('/auth/forgot-password always invalidates previous reset-pw tokens', async ({
	client,
	assert,
}) => {
	const { user } = await createUser();
	let tokens = await user.tokens().fetch();

	assert.empty(tokens.toJSON());

	let forgotPasswordResponse = await client
		.get('/auth/forgot-password')
		.send({
			email: user.email,
		})
		.end();

	forgotPasswordResponse.assertStatus(200);
	forgotPasswordResponse.assertJSONSubset({ success: true });

	forgotPasswordResponse = await client
		.get('/auth/forgot-password')
		.send({
			email: user.email,
		})
		.end();

	forgotPasswordResponse.assertStatus(200);
	forgotPasswordResponse.assertJSONSubset({ success: true });

	// test there's only one valid token
	tokens = await user
		.tokens()
		.where('is_revoked', false)
		.fetch();

	assert.equal(tokens.toJSON().length, 1);
});

test('/auth/reset-password', async ({ client, assert }) => {
	await Bull.reset();

	const { user } = await createUser({ append: { status: 'invited' } });
	const token = await user.generateToken('reset-pw');
	assert.isNotTrue(token.isRevoked());

	const password = 'new_password';

	const resetPasswordResponse = await client
		.post('/auth/reset-password')
		.send({
			email: user.email,
			token: token.token,
			password,
		})
		.end();

	resetPasswordResponse.assertStatus(200);
	resetPasswordResponse.assertJSONSubset({ success: true });

	// test that the token is now revoked.
	await token.reload();
	assert.isTrue(token.isRevoked());

	// test that the user status became verified
	await token.load('user');
	const { status } = token.toJSON().user;
	assert.isTrue(status === 'verified');

	// test that the password has been updated.
	const loginResponse = await client
		.post('/auth/login')
		.send({ email: user.email, password })
		.end();

	loginResponse.assertStatus(200);

	const bullCall = Bull.spy.calls[0];
	assert.equal('add', bullCall.funcName);
	assert.equal(user.email, bullCall.args[1].email);
	assert.equal('emails.reset-password', bullCall.args[1].template);
	assert.isTrue(Bull.spy.called);
});

test('/auth/reset-password fails with invalid token', async ({ client }) => {
	const { user } = await createUser({ append: { status: 'verified' } });
	const newToken = await user.generateToken('confirm-ac');

	const password = 'new_password';

	let resetPasswordResponse = await client
		.post('/auth/reset-password')
		.send({
			email: user.email,
			token: newToken.token,
			password,
		})
		.end();

	resetPasswordResponse.assertStatus(401);
	resetPasswordResponse.assertJSONSubset(
		errorPayload(errors.INVALID_TOKEN, antl('error.auth.invalidToken')),
	);

	// now try with a revoked token
	const token = await user.generateToken('reset-pw');
	await token.revoke();
	resetPasswordResponse = await client
		.post('/auth/reset-password')
		.send({
			email: user.email,
			token: token.token,
			password,
		})
		.end();

	resetPasswordResponse.assertStatus(401);
	resetPasswordResponse.assertJSONSubset(
		errorPayload(errors.INVALID_TOKEN, antl('error.auth.invalidToken')),
	);
	// now try with an expired token
	const expiredToken = await user.generateToken('reset-pw');
	const expiredDate = dayjs()
		.subtract(ttl + 1, 'days')
		.format('YYYY-MM-DD HH:mm:ss');
	expiredToken.created_at = expiredDate;

	await expiredToken.save();

	resetPasswordResponse = await client
		.post('/auth/reset-password')
		.send({
			email: user.email,
			token: expiredToken.token,
			password,
		})
		.end();

	resetPasswordResponse.assertStatus(401);

	// test that the password has not been updated.
	const loginResponse = await client
		.post('/auth/login')
		.send({ email: user.email, password })
		.end();

	loginResponse.assertStatus(401);
});
