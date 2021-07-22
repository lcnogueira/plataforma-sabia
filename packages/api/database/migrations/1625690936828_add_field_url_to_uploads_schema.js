/* eslint-disable no-underscore-dangle */
/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const Database = use('Database');
const Env = use('Env');
const Config = use('Adonis/Src/Config');
const app_url = Env.get('APP_URL');
const Logger = use('Logger');
const Helpers = use('Helpers');
const Drive = use('Drive');
const Upload = use('App/Models/Upload');
const fs = require('fs');
const mime = require('mime-types');

const { uploadsPath } = Config.get('upload');
const { makeSafeHash } = require('../../app/Utils/slugify');

class AddFieldUrlToUploadsSchema extends Schema {
	async up() {
		await this.hasColumn('uploads', 'url').then((exists) => {
			if (!exists) {
				this.table('uploads', (table) => {
					table.string('url', 255).after('object_id');
				});
			}
		});

		this.schedule(async (trx) => {
			await Database.table('uploads')
				.transacting(trx)
				.update(
					'url',
					Database.raw(
						`IF(uploads.object is not null,
							CONCAT('${app_url}/${uploadsPath}/', uploads.object, '/', uploads.filename),
							CONCAT('${app_url}/${uploadsPath}/', uploads.filename) )`,
					),
				);

			const uploads = await Upload.all();

			await Promise.all(
				uploads.rows.map(async (file) => {
					const folder = file.object
						? `${uploadsPath}/${file.object}/${file.object_id}`
						: `${uploadsPath}`;

					const ext = file.filename.split('.').pop();
					const fileName = `${await makeSafeHash(file.filename)}.${ext}`;

					const localPath = file.object
						? `${uploadsPath}/${file.object}`
						: `${uploadsPath}`;
					const filePath = await Helpers.publicPath(`${localPath}/${file.filename}`);

					const fileStream = await fs.createReadStream(filePath);

					const type = (await mime.lookup(filePath)) || 'application/octet-stream';
					Logger.info(type);

					file.url = await Drive.put(`${folder}/${fileName}`, fileStream, {
						ACL: 'public-read',
						ContentType: type,
					});

					file.save();

					fileStream._destroy();
				}),
			);
		});
	}

	down() {
		this.table('uploads', (table) => {
			table.dropColumn('url');
		});
	}
}

module.exports = AddFieldUrlToUploadsSchema;
