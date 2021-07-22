/* eslint-disable no-underscore-dangle */
const Helpers = use('Helpers');
const Upload = use('App/Models/Upload');
const Env = use('Env');

const { createReadStream } = require('fs');
const fs = require('fs/promises');

const { makeSafeHash } = require('../../Utils/slugify');

const { antl, errors, errorPayload, getTransaction } = require('../../Utils');

const Config = use('Adonis/Src/Config');
const { uploadsPath } = Config.get('upload');

const Drive = use('Drive');
const isTesting = Env.getOrFail('APP_ENV') === 'testing';

class UploadController {
	async index({ request }) {
		const allowedFilters = ['object_id', 'object'];
		const query = Object.fromEntries(
			Object.entries(request.get()).filter(([key]) => allowedFilters.includes(key)),
		);

		return Upload.query()
			.where(query)
			.withFilters(request)
			.withParams(request);
	}

	async store({ request, response, auth }) {
		const { meta } = request.all();
		const files = request.file('files');
		const objectInfo = meta ? JSON.parse(meta) : {};

		const folder = objectInfo.object
			? `${uploadsPath}/${objectInfo.object}/${objectInfo.object_id}`
			: `${uploadsPath}`;

		let trx;
		let uploads;
		try {
			const { init, commit } = getTransaction();
			const user = await auth.getUser();

			trx = await init();

			uploads = await Promise.all(
				files.files.map(async (file) => {
					const ext = file.clientName.split('.').pop();
					const fileName = `${await makeSafeHash(file.clientName)}.${ext}`;

					let url;
					if (isTesting) {
						file.move(Helpers.publicPath(folder), {
							name: fileName,
							overwrite: true,
						});
						url = `${Config.get('app.appURL')}/${folder}/${fileName}`;
					} else {
						const filePath = `${Helpers.tmpPath(folder)}/${fileName}`;
						await file.move(Helpers.tmpPath(folder), {
							name: fileName,
							overwrite: true,
						});

						const fileStream = await createReadStream(filePath);

						url = await Drive.put(`${folder}/${fileName}`, fileStream, {
							ACL: 'public-read',
							ContentType: `${file.type}/${file.subtype}`,
						});
						fileStream._destroy();
						Drive.disk('local').delete(filePath);
					}

					return user.uploads().create(
						{
							filename: file.clientName,
							object: objectInfo.object,
							object_id: objectInfo.object_id,
							url,
						},
						trx,
					);
				}),
			);

			await commit();
		} catch (error) {
			trx.rollback();
			if (uploads)
				await Promise.all(
					uploads.map((file) => Drive.delete(new URL(file.url).pathname.slice(1))),
				);
			return response
				.status(400)
				.send(
					errorPayload(
						errors.RESOURCE_SAVING_ERROR,
						antl('error.resource.resourceSavingError'),
					),
				);
		}
		return uploads;
	}

	async destroy({ params, response }) {
		const upload = await Upload.findOrFail(params.id);

		const file = decodeURIComponent(new URL(upload.url).pathname.slice(1));

		if (!isTesting && (await Drive.exists(file))) {
			try {
				await Drive.delete(file);
			} catch (error) {
				return response
					.status(400)
					.send(
						errorPayload(
							errors.RESOURCE_DELETED_ERROR,
							antl('error.resource.resourceDeletedError'),
						),
					);
			}
		} else {
			await fs
				.access(Helpers.publicPath(file))
				.then(() => {
					fs.unlink(Helpers.publicPath(file));
				})
				.catch(() => {});
		}
		await upload.delete();

		return response.status(200).send({ success: true });
	}

	async show({ params, response }) {
		return response.download(Helpers.publicPath(`${uploadsPath}/${params.filename}`));
	}

	async showWithObject({ params, response }) {
		return response.download(
			Helpers.publicPath(`${uploadsPath}/${params.object}/${params.filename}`),
		);
	}
}

module.exports = UploadController;
