const { test, trait } = use('Test/Suite')('Upload');
const Helpers = use('Helpers');
const fs = require('fs').promises;
const { createUser } = require('../utils/Suts');

const Factory = use('Factory');
const Logger = use('Logger');

trait('Test/ApiClient');
trait('Auth/Client');
trait('DatabaseTransactions');

const { antl, errors, errorPayload } = require('../../app/Utils');

const User = use('App/Models/User');
const Upload = use('App/Models/Upload');

const base64String =
	'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI' +
	'//////////////////////////////////////////////////8BVVpaeGl464KC6//////////////////////////' +
	'////////////////////////////////////////////////CABEIADIAMgMBEQACEQEDEQH/xAAYAAEBAQEBAAAAAA' +
	'AAAAAAAAAAAwIBBP/aAAgBAQAAAAD151oRLDMnbCGZXuYnh6NEFvP6OuOn/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAIBA' +
	'//aAAgBAhAAAADdzBPRIXiRq5kQ2hmqkB//xAAXAQEBAQEAAAAAAAAAAAAAAAAAAgED/9oACAEDEAAAAMzdG81jIbYl' +
	'F0ZSdGzsWA//xAAjEAABAwQCAQUAAAAAAAAAAAABAAIRAxIhMSBxYQQTQVGx/9oACAEBAAE/AHOt8k6RLxmQmOu74uc' +
	'fd6WACGiJMntAwQeLmhwQ0pTKlpg6/OOsfSdMYRcvT1LhafjXB7JyNo43hFrS7ytaxCa4OEjhVquBLbOjKoNaZMZ1BU' +
	'CITrqVXAkFDXCMzw//xAAbEQEAAgMBAQAAAAAAAAAAAAABABECECAhMP/aAAgBAgEBPwAnkTktygR5NpysMtPKMvIIX' +
	'dvNy70e/H//xAAcEQEAAgMAAwAAAAAAAAAAAAABABECECASITD/2gAIAQMBAT8AWKwb5y9Yxbhyl7HkImsXkSJivVTx' +
	'B02Px//Z';
const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');

const fsExists = async (path) => {
	return fs
		.access(path)
		.then(() => {
			return true;
		})
		.catch(() => {
			return false;
		});
};

test('POST /uploads trying to upload non-allowed file extension.', async ({ client }) => {
	const { user: loggedUser } = await createUser();

	await fs.writeFile(Helpers.tmpPath(`resources/test/test.data`), 'Hello World!');

	const response = await client
		.post('uploads')
		.loginVia(loggedUser, 'jwt')
		.attach('files[]', Helpers.tmpPath(`resources/test/test.data`))
		.end();
	response.assertJSONSubset({
		error: {
			error_code: 'VALIDATION_ERROR',
			message: [
				{
					message:
						'Invalid file extension data. Only jpg, jpeg, jfif, pjpeg, pjp, png, webp, pdf are allowed',
					field: 'files.0',
					validation: 'fileExt',
				},
				{
					message:
						'Invalid file extension data. Only jpg, jpeg, jfif, pjpeg, pjp, png, webp, pdf are allowed',
					field: 'files.0',
					validation: 'fileSize',
				},
				{
					message:
						'Invalid file extension data. Only jpg, jpeg, jfif, pjpeg, pjp, png, webp, pdf are allowed',
					field: 'files.0',
					validation: 'fileTypes',
				},
			],
		},
	});
});

test('POST /uploads creates/saves a new upload.', async ({ client, assert }) => {
	try {
		const { user: loggedUser } = await createUser();

		await fs.writeFile(Helpers.tmpPath(`resources/test/test-image.jpg`), base64Data, 'base64');

		const response = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.attach('files[]', Helpers.tmpPath(`resources/test/test-image.jpg`))
			.end();

		const result = await fsExists(
			Helpers.publicPath(
				`${decodeURIComponent(new URL(response.body[0].url).pathname.slice(1))}`,
			),
		);
		assert.isTrue(result);

		const uploadCreated = await Upload.findOrFail(response.body[0].id);
		response.assertStatus(200);
		response.body[0].object = null;
		response.body[0].object_id = null;
		response.assertJSONSubset([uploadCreated.toJSON()]);
	} catch (error) {
		Logger.error(error);
	}
});

test('POST /uploads creates/saves multiple uploads.', async ({ client, assert }) => {
	const { user: loggedUser } = await createUser();

	await fs.writeFile(Helpers.tmpPath(`resources/test/test-image_2.jpg`), base64Data, 'base64');
	await fs.writeFile(Helpers.tmpPath(`resources/test/test-image_3.jpg`), base64Data, 'base64');
	await fs.writeFile(Helpers.tmpPath(`resources/test/test-image_4.jpg`), base64Data, 'base64');

	const response = await client
		.post('uploads')
		.loginVia(loggedUser, 'jwt')
		.attach('files[]', Helpers.tmpPath(`resources/test/test-image_2.jpg`))
		.attach('files[]', Helpers.tmpPath(`resources/test/test-image_3.jpg`))
		.attach('files[]', Helpers.tmpPath(`resources/test/test-image_4.jpg`))
		.end();

	response.body.map(async (file) => {
		const result = await fsExists(
			Helpers.publicPath(`${decodeURIComponent(new URL(file.url).pathname.slice(1))}`),
		);
		assert.isTrue(result);
	});

	const filesIds = response.body.map((file) => file.id);
	const uploadsCreated = await Upload.query()
		.whereIn('id', filesIds)
		.fetch();

	response.assertStatus(200);
	response.body = response.body.map((body) => {
		body.object = null;
		body.object_id = null;
		return body;
	});
	response.assertJSONSubset(uploadsCreated.toJSON());
});

test('POST /uploads creates/saves a new upload with object and object_id.', async ({
	client,
	assert,
}) => {
	try {
		const { user: loggedUser } = await createUser();
		const technologyInst = await Factory.model('App/Models/Technology').create();

		const meta = {
			object: 'technologies',
			object_id: technologyInst.id,
		};

		await technologyInst.users().attach([loggedUser.id]);

		await fs.writeFile(Helpers.tmpPath(`resources/test/test-image.jpg`), base64Data, 'base64');

		const response = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.field('meta', JSON.stringify(meta))
			.attach('files[]', Helpers.tmpPath(`resources/test/test-image.jpg`))
			.end();

		const result = await fsExists(
			Helpers.publicPath(
				`${decodeURIComponent(new URL(response.body[0].url).pathname.slice(1))}`,
			),
		);
		assert.isTrue(result);
		const uploadCreated = await Upload.findOrFail(response.body[0].id);
		response.assertStatus(200);
		response.assertJSONSubset([uploadCreated.toJSON()]);
	} catch (error) {
		Logger.error(error);
	}
});

test('POST /uploads user trying to upload for object and object_id without permission.', async ({
	client,
}) => {
	try {
		const { user: loggedUser } = await createUser();
		const technologyInst = await Factory.model('App/Models/Technology').create();

		const meta = {
			object: 'technologies',
			object_id: technologyInst.id,
		};

		const response = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.field('meta', JSON.stringify(meta))
			.attach('files[]', Helpers.tmpPath(`resources/test/test-image.jpg`))
			.end();

		response.assertStatus(403);
		response.assertJSONSubset(
			errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
		);
	} catch (error) {
		Logger.error(error);
	}
});

test('DELETE /uploads/:id deletes upload.', async ({ client, assert }) => {
	try {
		const { user: loggedUser } = await createUser();

		await fs.writeFile(Helpers.tmpPath(`resources/test/test-delete.jpg`), base64Data, 'base64');

		const responseUpload = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.attach('files[]', Helpers.tmpPath(`resources/test/test-delete.jpg`))
			.end();

		let result = await fsExists(
			Helpers.publicPath(
				`${decodeURIComponent(new URL(responseUpload.body[0].url).pathname.slice(1))}`,
			),
		);
		assert.isTrue(result);

		const response = await client
			.delete(`uploads/${responseUpload.body[0].id}`)
			.loginVia(loggedUser, 'jwt')
			.end();

		result = await fsExists(
			Helpers.publicPath(
				`${decodeURIComponent(new URL(responseUpload.body[0].url).pathname.slice(1))}`,
			),
		);
		assert.isFalse(result);

		response.assertStatus(200);
		response.assertJSONSubset({
			success: true,
		});
	} catch (error) {
		Logger.error(error);
	}
});

test('DELETE /uploads/:id user trying to delete other user upload.', async ({ client, assert }) => {
	try {
		const { user: loggedUser } = await createUser();
		const otherUser = await User.first();

		await fs.writeFile(Helpers.tmpPath(`resources/test/test-delete.jpg`), base64Data, 'base64');

		const responseUpload = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.attach('files[]', Helpers.tmpPath(`resources/test/test-delete.jpg`))
			.end();

		const result = await fsExists(
			Helpers.publicPath(
				`${decodeURIComponent(new URL(responseUpload.body[0].url).pathname.slice(1))}`,
			),
		);
		assert.isTrue(result);

		const response = await client
			.delete(`uploads/${responseUpload.body[0].id}`)
			.loginVia(otherUser, 'jwt')
			.end();

		response.assertStatus(403);
		response.assertJSONSubset(
			errorPayload(errors.UNAUTHORIZED_ACCESS, antl('error.permission.unauthorizedAccess')),
		);
	} catch (error) {
		Logger.error(error);
	}
});

test('DELETE /uploads/:id delete a record where the associated file does not exist in the directory.', async ({
	client,
	assert,
}) => {
	try {
		const { user: loggedUser } = await createUser();

		await fs.writeFile(Helpers.tmpPath(`resources/test/test-delete.jpg`), base64Data, 'base64');

		const responseUpload = await client
			.post('uploads')
			.loginVia(loggedUser, 'jwt')
			.attach('files[]', Helpers.tmpPath(`resources/test/test-delete.jpg`))
			.end();

		const pathFile = Helpers.publicPath(
			`${decodeURIComponent(new URL(responseUpload.body[0].url).pathname.slice(1))}`,
		);

		let result = await fsExists(pathFile);
		assert.isTrue(result);

		await fs.unlink(pathFile);

		result = await fsExists(pathFile);
		assert.isFalse(result);

		const response = await client
			.delete(`uploads/${responseUpload.body[0].id}`)
			.loginVia(loggedUser, 'jwt')
			.end();

		response.assertStatus(200);
		response.assertJSONSubset({
			success: true,
		});
	} catch (error) {
		Logger.error(error);
	}
});
