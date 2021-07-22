/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Helpers = use('Helpers');
const fs = require('fs').promises;

const Config = use('Adonis/Src/Config');
const { uploadsPath } = Config.get('upload');

const { incrementSlugSuffix } = require('../Utils/slugify');

class Upload extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
	}

	static async checkFileExist(fileName, extname, object = null) {
		const objectPath = object ? `${object}/` : '';
		const path = Helpers.publicPath(`${uploadsPath}/${objectPath}${fileName}.${extname}`);
		return fs
			.access(path)
			.then(() => {
				const newFileName = incrementSlugSuffix(fileName);
				return this.checkFileExist(newFileName, extname, object);
			})
			.catch(() => {
				return `${fileName}.${extname}`;
			});
	}

	static async getUniqueFileName(file, object = null) {
		const filenameWithOutExt = file.clientName.replace(`.${file.extname}`, '');
		let finalName = filenameWithOutExt;

		const fileNameStoredPreviously = await this.query()
			.where('filename', 'REGEXP', `${filenameWithOutExt}.*(-(d*))?.*.${file.extname}$`)
			.where({ object })
			.orderBy('id', 'desc')
			.first();
		if (fileNameStoredPreviously) {
			let newFileName = fileNameStoredPreviously.filename;
			newFileName = newFileName.replace(`.${file.extname}`, '');
			finalName = incrementSlugSuffix(newFileName);
		}

		return this.checkFileExist(finalName, file.extname, object);
	}

	/**
	 * Runs the upload query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} request The request object
	 * @returns {object}
	 */
	static async scopeWithFilters(query, request) {
		const filters = request.all();
		if (filters.object) {
			query.where({ object: filters.object });
		}

		if (filters.object_id) {
			query.where({ object_id: filters.object_id });
		}
	}

	user() {
		return this.belongsTo('App/Models/User');
	}
}

module.exports = Upload;
