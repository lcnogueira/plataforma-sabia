const crypto = require('crypto');

/* @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Role = use('App/Models/Role');
const Disclaimer = use('App/Models/Disclaimer');
const Token = use('App/Models/Token');
const Config = use('Config');

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

const { roles } = require('../Utils/roles_capabilities');

/**
 * Required fields for checking if personal data registration is completed
 */
const personal_data_required_fields = [
	'full_name',
	'email',
	'cpf',
	'birth_date',
	'phone_number',
	'zipcode',
	'address',
	'district',
	'city_id',
	'state_id',
	'country',
];

const mappingOperationsChecking = {
	can_create_technology: ['check_personal_data', 'check_organizational_data'],
	can_be_curator: ['check_personal_data', 'check_academic_data', 'check_organizational_data'],
	can_create_announcement: ['check_personal_data'],
	can_create_idea: ['check_personal_data'],
	can_create_service: ['check_personal_data', 'check_organizational_data'],
	can_create_service_order: ['check_personal_data'],
	can_buy_technology: ['check_personal_data'],
	can_make_technology_question: ['check_personal_data'],
	can_create_institution: ['check_personal_data'],
	can_create_technology_review: ['check_personal_data'],
};

class User extends Model {
	static boot() {
		super.boot();
		this.addTrait('Params');
		/**
		 * A hook to hash the user password before saving
		 * it to the database.
		 */
		this.addHook('beforeSave', async (userInstance) => {
			if (userInstance.dirty.password) {
				// eslint-disable-next-line no-param-reassign
				userInstance.password = await Hash.make(userInstance.password);
			}
			const { full_name } = userInstance;

			const fullNameSplitted = full_name && full_name.split(' ');

			if (fullNameSplitted && fullNameSplitted.length) {
				if (fullNameSplitted.length > 1) {
					userInstance.first_name = fullNameSplitted.slice(0, -1).join(' ');
					userInstance.last_name = fullNameSplitted.slice(-1).join(' ');
				} else {
					userInstance.first_name = fullNameSplitted[0];
					userInstance.last_name = '';
				}
			}
			delete userInstance.$attributes.full_name;
		});
	}

	static async create(payload) {
		const modelInstance = new User();
		const { status, role, ...data } = payload;

		if (status) data.status = status;

		modelInstance.fill(data);
		await modelInstance.save();
		const userRole = await Role.getRole(role || roles.DEFAULT_USER);
		await modelInstance.role().associate(userRole);
		return modelInstance;
	}

	static get computed() {
		return ['full_name', 'lattes_url'];
	}

	static get hidden() {
		return ['password', 'temp_email'];
	}

	getFullName({ first_name, last_name }) {
		return `${first_name} ${last_name}`.trim();
	}

	getLattesUrl({ lattes_id }) {
		return `${Config.get('researcher.cnpqBasePath')}/${lattes_id}`;
	}

	/**
	 * Checks if user data based in checks param
	 *
	 * @returns {string[]} uncompletedFields: Personal data fields uncompleted
	 * @param {string[]} checks checking params
	 */
	async getCheckData(checks) {
		const mappingCheckMethods = {
			check_personal_data: 'getCheckPersonalData',
			check_academic_data: 'getCheckAcademicData',
			check_organizational_data: 'getCheckOrganizationalData',
		};
		const unCompletedFields = await Promise.all(
			checks
				.map(async (check) => (await this[mappingCheckMethods[check]]()) || null)
				.filter(Boolean),
		);

		return unCompletedFields.flat(1);
	}

	/**
	 * Checks if user personal data registration is completed
	 * based on personal_data_required_fields
	 *
	 * @returns {string[]} uncompletedFields: Personal data fields uncompleted
	 */
	getCheckPersonalData() {
		return personal_data_required_fields
			.map((field) => {
				const userField = this.toJSON()[field];

				const allowedField =
					userField &&
					(userField?.length || Object.values(userField)?.length || userField > 0);

				return !allowedField ? field : null;
			})
			.filter(Boolean);
	}

	/**
	 * Checks if user academic data registration is completed
	 *
	 * @returns {string[]} uncompletedFields: Academic data fields uncompleted
	 */
	async getCheckAcademicData() {
		const uncompletedFields = [];

		const { lattes_id } = this;
		if (!(lattes_id && (lattes_id?.length || Object.values(lattes_id)?.length))) {
			uncompletedFields.push('lattes_id');
		}

		const knowledgeArea = await this.areas().first();
		if (!knowledgeArea) {
			uncompletedFields.push('knowledgeArea');
		}

		return uncompletedFields;
	}

	/**
	 * Checks if user organizational data registration is completed
	 *
	 * @returns {string[]} uncompletedFields: Organizational data fields uncompleted
	 */
	async getCheckOrganizationalData() {
		const uncompletedFields = [];

		const institution = await this.institution().first();
		if (!institution) {
			uncompletedFields.push('institution');
		}

		return uncompletedFields;
	}

	async getOperations() {
		const operations = await Promise.all(
			Object.entries(mappingOperationsChecking).map(async ([operation, checks]) => {
				const unCompletedFields = await this.getCheckData(checks);
				return { [operation]: !unCompletedFields.length };
			}),
		);
		return operations.reduce((acc, op) => ({ ...acc, ...op }));
	}

	/**
	 * A relationship on tokens is required for auth to
	 * work. Since features like `refreshTokens` or
	 * `rememberToken` will be saved inside the
	 * tokens table.
	 *
	 * @function tokens
	 *
	 * @returns {object}
	 */
	tokens() {
		return this.hasMany('App/Models/Token');
	}

	/**
	 * Every user has a role.
	 *
	 * @returns {Model} Role Model
	 */
	role() {
		return this.belongsTo('App/Models/Role');
	}

	/**
	 * Users have many permissions. Each role comes with it's own set of permission
	 * but a user can also be assigned an permission individually.
	 *
	 * @returns {Model[]} Array of Permissions.
	 */
	permissions() {
		return this.belongsToMany('App/Models/Permission');
	}

	technologies() {
		return this.belongsToMany('App/Models/Technology').withPivot(['role']);
	}

	reviews() {
		return this.hasMany('App/Models/TechnologyReview');
	}

	technologyBookmarks() {
		return this.belongsToMany('App/Models/Technology').pivotTable('user_bookmarks');
	}

	serviceBookmarks() {
		return this.belongsToMany('App/Models/Service').pivotTable('service_bookmarks');
	}

	uploads() {
		return this.hasMany('App/Models/Upload');
	}

	disclaimers() {
		return this.belongsToMany('App/Models/Disclaimer')
			.pivotTable('user_disclaimers')
			.withTimestamps();
	}

	comments() {
		return this.hasMany('App/Models/TechnologyComment');
	}

	institution() {
		return this.belongsTo('App/Models/Institution');
	}

	announcements() {
		return this.hasMany('App/Models/Announcement');
	}

	messages() {
		return this.hasMany('App/Models/Message');
	}

	ideas() {
		return this.hasMany('App/Models/Idea');
	}

	orders() {
		return this.hasMany('App/Models/TechnologyOrder');
	}

	services() {
		return this.hasMany('App/Models/Service');
	}

	serviceOrders() {
		return this.hasMany('App/Models/ServiceOrder');
	}

	serviceOrderReviews() {
		return this.hasMany('App/Models/ServiceOrderReview');
	}

	areas() {
		return this.belongsToMany(
			'App/Models/KnowledgeArea',
			'user_id',
			'knowledge_area_id',
			'id',
			'knowledge_area_id',
		).pivotTable('user_areas');
	}

	deviceTokens() {
		return this.hasMany('App/Models/DeviceToken');
	}

	city() {
		return this.belongsTo('App/Models/City');
	}

	state() {
		return this.belongsTo('App/Models/State');
	}

	async generateToken(type) {
		const token = await Token.generateUniqueTokenCode();
		return this.tokens().create({
			type,
			token,
			is_revoked: false,
		});
	}

	isVerified() {
		return this.status === 'verified';
	}

	isPending() {
		return this.status === 'pending';
	}

	isInvited() {
		return this.status === 'invited';
	}

	async getRole() {
		const role = await this.role().first();
		return role.role;
	}

	/**
	 * Invites an user
	 *
	 * @param {object} userData The user data
	 * @param {boolean} provision Provisions the user if it's true
	 * @returns {User} The invited user
	 */
	static invite(userData, provision = false) {
		return provision
			? User.findOrCreate(
					{ email: userData.email },
					{
						...userData,
						password: crypto.randomBytes(12).toString('hex'),
						status: 'invited',
					},
			  )
			: User.findBy('email', userData.email);
	}

	/**
	 * Runs the user query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} filters The query filters
	 *
	 * @returns {object}
	 */
	static scopeWithBookmarksFilters(query, filters) {
		const technologyId = Number(filters.technologyId);
		const serviceId = Number(filters.serviceId);

		query.with('technologyBookmarks');
		query.with('serviceBookmarks');

		if (technologyId) {
			query.whereHas('technologyBookmarks', (builder) => {
				builder.where({ technology_id: technologyId });
			});
		}

		if (serviceId) {
			query.whereHas('serviceBookmarks', (builder) => {
				builder.where({ service_id: serviceId });
			});
		}

		return query;
	}

	/**
	 * Runs the term query with the provided filters.
	 *
	 * @param {object} query The query object.
	 * @param {object} filters The query filters
	 *
	 * @returns {object}
	 */
	static scopeWithResearcherFilters(query, filters) {
		if (filters.name) {
			query
				.where('first_name', 'LIKE', `%${filters.name}%`)
				.orWhere('last_name', 'LIKE', `%${filters.name}%`);
		}
		if (filters.institution) {
			query.whereHas('institution', (builder) => {
				builder.where('name', 'LIKE', `%${filters.institution}%`);
			});
		}

		if (filters.initials) {
			query.whereHas('institution', (builder) => {
				builder.where('initials', 'LIKE', `%${filters.initials}%`);
			});
		}

		if (filters.role) {
			query.whereHas('role', (builder) => {
				builder.where('role', 'LIKE', `%${filters.role}%`);
			});
		}

		if (filters.status) {
			query.where('status', 'LIKE', `%${filters.status}%`);
		}

		if (filters.keyword) {
			query.whereHas('technologies.terms', (builder) => {
				builder.where('term', 'LIKE', `%${filters.keyword}%`);
			});
		}

		if (filters.area) {
			const areaList = filters.area?.split(',') || [];
			if (areaList.length) {
				query.whereHas('areas', (builder) => {
					builder.whereIn('knowledge_areas.knowledge_area_id', areaList);
				});
			}
		}

		return query;
	}

	async acceptMandatory(type) {
		let mandatory = await Disclaimer.query()
			.select('id')
			.where('required', true)
			.where('type', type)
			.fetch();

		mandatory = mandatory.toJSON().map((row) => {
			return row.id;
		});

		return this.accept(mandatory);
	}

	async accept(arrayIds) {
		let arrayChecked = await Disclaimer.query()
			.select('id')
			.whereIn('id', arrayIds)
			.fetch();

		arrayChecked = arrayChecked.toJSON().map((row) => {
			return row.id;
		});
		return this.disclaimers().attach(arrayChecked);
	}
}

module.exports = User;
