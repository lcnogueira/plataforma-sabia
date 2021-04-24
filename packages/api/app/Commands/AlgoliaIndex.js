/* eslint-disable no-await-in-loop */
const Database = use('Database');
const Technology = use('App/Models/Technology');
const Idea = use('App/Models/Idea');
const Service = use('App/Models/Service');
const Announcement = use('App/Models/Announcement');
const Institution = use('App/Models/Institution');
const { Command } = require('@adonisjs/ace');
const ProgressBar = require('cli-progress');
const https = require('https');
const { Algolia } = require('../Utils');

class AlgoliaIndex extends Command {
	constructor() {
		super();
		this.verboseMode = false;
		this.algoliaTechnologies = Algolia.initIndex('technology');
		this.algoliaServices = Algolia.initIndex('service');
		this.algoliaIdeas = Algolia.initIndex('idea');
		this.algoliaAnnouncements = Algolia.initIndex('announcement');
		this.algoliaInstitutions = Algolia.initIndex('institution');
	}

	static get signature() {
		return `
			algolia:index { --override?: Whether to override the index or not. }
			{ --log?: log the process. }
			{ --settings?: Override index settings. }
		`;
	}

	static get description() {
		return 'Indexes content to Algolia.';
	}

	/**
	 * Logs message to the console.
	 *
	 * @param {string} message The message to log.
	 */
	log(message) {
		if (this.verboseMode) {
			super.info(message);
		}
	}

	/**
	 * Indexes all data to algolia.
	 */
	async index() {
		const progressBar = new ProgressBar.SingleBar({});
		const successfullyIntegrated = {
			technology: 0,
			idea: 0,
			service: 0,
			announcement: 0,
			institution: 0,
		};
		let page = 0;
		let lastPage;

		// Count
		const count = (
			await Promise.all([
				Technology.query()
					.available()
					.getCount(),
				Idea.getCount(),
				Service.getCount(),
				Announcement.query()
					.published()
					.getCount(),
				Institution.getCount(),
			])
		).reduce((acc, item) => acc + item, 0);

		progressBar.start(count, 0);

		// Index Technologies
		page = 0;
		do {
			page += 1;
			const technologies = await Technology.query()
				.populateForAlgolia()
				.paginate(page);
			const { pages } = technologies;
			const { data } = technologies.toJSON();

			if (data.length) {
				await Algolia.saveIndex('technology', data, { saveMany: true });
				successfullyIntegrated.technology += data.length;
				progressBar.increment(data.length);
			}

			({ lastPage } = pages);
		} while (page <= lastPage);

		// Index Ideas
		page = 0;
		do {
			page += 1;
			const ideas = await Idea.query()
				.populateForAlgolia()
				.paginate(page);
			const { pages } = ideas;
			const { data } = ideas.toJSON();

			if (data.length) {
				await Algolia.saveIndex('idea', data, { saveMany: true });
				successfullyIntegrated.idea += data.length;
				progressBar.increment(data.length);
			}

			({ lastPage } = pages);
		} while (page <= lastPage);

		// Index Services
		page = 0;
		do {
			page += 1;
			const services = await Service.query()
				.populateForAlgolia()
				.paginate(page);
			const { pages } = services;
			const { data } = services.toJSON();

			if (data.length) {
				await Algolia.saveIndex('service', data, { saveMany: true });
				successfullyIntegrated.service += data.length;
				progressBar.increment(data.length);
			}

			({ lastPage } = pages);
		} while (page <= lastPage);

		// Index Announcement
		page = 0;
		do {
			page += 1;
			const announcements = await Announcement.query()
				.populateForAlgolia()
				.paginate(page);
			const { pages } = announcements;
			const { data } = announcements.toJSON();

			if (data.length) {
				await Algolia.saveIndex('announcement', data, { saveMany: true });
				successfullyIntegrated.announcement += data.length;
			}

			progressBar.increment(data.length);
			({ lastPage } = pages);
		} while (page <= lastPage);

		// Index Institution
		page = 0;
		do {
			page += 1;
			const institutions = await Institution.query()
				.populateForAlgolia()
				.paginate(page);
			const { pages } = institutions;
			const { data } = institutions.toJSON();

			if (data.length) {
				await Algolia.saveIndex('institution', data, { saveMany: true });
				successfullyIntegrated.institution += data.length;
				progressBar.increment(data.length);
			}

			({ lastPage } = pages);
		} while (page <= lastPage);

		progressBar.stop();

		// Report integration counter
		this.success('End of saving indexes');
		this.log('{');
		Object.entries(successfullyIntegrated).forEach(([model, quantity]) => {
			this.log(`  "${model}": ${quantity},`);
		});
		this.log('}');
	}

	/**
	 * Pushes index settings
	 *
	 * @see https://www.algolia.com/doc/api-reference/settings-api-parameters/
	 * @param {object} algolia The algolia object
	 * @param {Array} replicas The algolia index replicas.
	 * @param {Array} searchableAttributes The searchable attributes
	 * @param {Array} attributesForFaceting The list of attributes that will be used for faceting/filtering.
	 * @param {string[]} [customRanking] The list of custom ranking for the index.
	 */
	async pushSettings(
		algolia,
		replicas,
		searchableAttributes,
		attributesForFaceting,
		customRanking = [],
	) {
		algolia.setSettings({
			searchableAttributes,
			replicas,
			attributesForFaceting,
			customRanking,
		});
	}

	/**
	 * Handles the command.
	 *
	 * @param {object} args The arguments.
	 * @param {object} options Options passed.
	 * @param {boolean} options.log Whether to log the indexing process.
	 * @param {boolean} options.override Whether to override the exiting index or not.
	 * @param {boolean} options.settings Push index settings.
	 */
	async handle(args, { log, override, settings }) {
		this.verboseMode = log;
		const { indexes } = Algolia.config;
		this.log('Starting indexing process');

		const overrideIndex = override || (await this.confirm('Do you want to override indices?'));

		if (overrideIndex) {
			this.log('Clearing all index objects\n');
			await Promise.all([
				this.algoliaTechnologies.clearObjects(),
				this.algoliaServices.clearObjects(),
				this.algoliaIdeas.clearObjects(),
				this.algoliaAnnouncements.clearObjects(),
				this.algoliaInstitutions.clearObjects(),
			]);
		}

		await this.index();

		// Change the attributes for faceting/filtering if needed
		const attributesForFaceting = {
			technologies: [
				'searchable(classification)',
				'searchable(dimension)',
				'searchable(targetAudience)',
				'searchable(type)',
				'searchable(forSale)',
				'searchable(institution)',
				'searchable(institution_id)',
				'searchable(keywords)',
			],
			services: [
				'searchable(type)',
				'searchable(institution)',
				'searchable(institution_id)',
				'searchable(keywords)',
			],
			ideas: ['searchable(keywords)'],
			announcements: ['searchable(keywords)'],
			institutions: [
				'searchable(category)',
				'searchable(types)',
				'searchable(city)',
				'searchable(state)',
			],
		};

		const customRanking = {
			technologies: ['desc(likes)'],
			services: ['desc(likes)'],
			ideas: [],
			announcements: [],
			institutions: [],
		};

		// Change the replicas if needed
		const replicas = {
			technologies: [
				{
					name: `${indexes.technology.indexName}_installation_time_asc`,
					column: 'installation_time',
					strategy: 'asc',
					attributesForFaceting: attributesForFaceting.technologies,
				},
				{
					name: `${indexes.technology.indexName}_installation_time_desc`,
					column: 'installation_time',
					strategy: 'desc',
					attributesForFaceting: attributesForFaceting.technologies,
				},
			],
			ideas: [
				{
					name: `${indexes.idea.indexName}_created_at_asc`,
					column: 'created_at',
					strategy: 'asc',
					attributesForFaceting: attributesForFaceting.ideas,
				},
				{
					name: `${indexes.idea.indexName}_created_at_desc`,
					column: 'created_at',
					strategy: 'desc',
					attributesForFaceting: attributesForFaceting.ideas,
				},
			],
			announcements: [
				{
					name: `${indexes.announcement.indexName}_created_at_asc`,
					column: 'created_at',
					strategy: 'asc',
					attributesForFaceting: attributesForFaceting.announcements,
				},
				{
					name: `${indexes.announcement.indexName}_created_at_desc`,
					column: 'created_at',
					strategy: 'desc',
					attributesForFaceting: attributesForFaceting.announcements,
				},
			],
			institutions: [
				{
					name: `${indexes.institution.indexName}_created_at_asc`,
					column: 'created_at',
					strategy: 'asc',
					attributesForFaceting: attributesForFaceting.institutions,
				},
				{
					name: `${indexes.institution.indexName}_created_at_desc`,
					column: 'created_at',
					strategy: 'desc',
					attributesForFaceting: attributesForFaceting.institutions,
				},
			],
		};

		// Change the attributes for searching if needed
		const searchableAttributes = {
			technologies: [
				'title',
				'description',
				'classification',
				'dimension',
				'targetAudience',
				'type',
				'forSale',
				'institution',
				'keywords',
			],
			services: ['name', 'type', 'institution', 'keywords'],
			ideas: ['title', 'description', 'keywords'],
			announcements: ['title', 'description', 'keywords'],
			institutions: ['name', 'initials', 'category'],
		};

		// Report integration counter
		this.success('\nSaving replica indexes');
		this.log('[');
		for (const indexReplicas of Object.values(replicas)) {
			for (const replica of indexReplicas) {
				await this.createReplica(replica);
				this.log(`  "${replica.name}",`);
			}
		}
		this.log(']');

		const pushSettings =
			settings || (await this.confirm('Do you want to push index settings?'));
		if (pushSettings) {
			this.log('\nPushing index settings');

			const settingsToPush = {
				technology: {
					algolia: this.algoliaTechnologies,
					replicas: replicas.technologies.map((replica) => replica.name),
					searchableAttributes: searchableAttributes.technologies,
					attributesForFaceting: attributesForFaceting.technologies,
					customRanking: customRanking.technologies,
				},
				services: {
					algolia: this.algoliaServices,
					replicas: null,
					searchableAttributes: searchableAttributes.services,
					attributesForFaceting: attributesForFaceting.services,
					customRanking: customRanking.services,
				},
				ideas: {
					algolia: this.algoliaIdeas,
					replicas: replicas.ideas.map((replica) => replica.name),
					searchableAttributes: searchableAttributes.ideas,
					attributesForFaceting: attributesForFaceting.ideas,
					customRanking: customRanking.ideas,
				},
				announcements: {
					algolia: this.algoliaAnnouncements,
					replicas: replicas.announcements.map((replica) => replica.name),
					searchableAttributes: searchableAttributes.announcements,
					attributesForFaceting: attributesForFaceting.announcements,
					customRanking: customRanking.announcements,
				},
				institutions: {
					algolia: this.algoliaInstitutions,
					replicas: replicas.institutions.map((replica) => replica.name),
					searchableAttributes: searchableAttributes.institutions,
					attributesForFaceting: attributesForFaceting.institutions,
					customRanking: customRanking.institutions,
				},
			};

			await Promise.all(
				Object.values(settingsToPush).map(async (setting) => {
					await this.pushSettings(
						setting.algolia,
						setting.replicas,
						setting.searchableAttributes,
						setting.attributesForFaceting,
						setting.customRanking,
					);
				}),
			);
		}

		this.success('Indexing completed');

		await this.createQuerySuggestions();

		Database.close();
	}

	/**
	 * Creates an index replica.
	 *
	 * @param {object} options Provided options.
	 * @param {string} options.name The replica name.
	 * @param {string} options.column The column to be used to create the replica index.
	 * @param {string} options.strategy Whether the column should be ascendent or descendent.
	 * @param {string[]} options.attributesForFaceting The list of attributes for faceting.
	 */
	async createReplica({ name, column, strategy, attributesForFaceting = [] }) {
		const replicaIndex = Algolia.initIndex(name);

		await replicaIndex.setSettings({
			ranking: [
				`${strategy}(${column})`,
				'typo',
				'geo',
				'words',
				'filters',
				'proximity',
				'attribute',
				'exact',
				'custom',
			],
			attributesForFaceting,
		});
	}

	/**
	 * Creates query suggestions configuration
	 *
	 * @see https://www.algolia.com/doc/rest-api/query-suggestions
	 * @returns {void}
	 */
	async createQuerySuggestions() {
		this.log('\nCreating query suggestions');
		const { appId, apiKey, indexes } = Algolia.config;

		const algoliaQuerySuggestionIndexes = [
			{
				sourceIndex: indexes.technology.indexName,
				indexName: indexes.technology.querySuggestions,
				generate: [
					['classification'],
					['dimension'],
					['targetAudience'],
					['type'],
					['keywords'],
				],
			},
			{
				sourceIndex: indexes.service.indexName,
				indexName: indexes.service.querySuggestions,
				generate: [['type'], ['keywords']],
			},
			{
				sourceIndex: indexes.institution.indexName,
				indexName: indexes.institution.querySuggestions,
				generate: [['name'], ['initials']],
			},
		];

		for (const { sourceIndex, indexName, generate } of algoliaQuerySuggestionIndexes) {
			const requestData = {
				indexName,
				sourceIndices: [
					{
						indexName: sourceIndex,
						minHits: 1,
						generate,
					},
				],
			};

			const isQuerySuggestionsCreated = await this.isQuerySuggestionsCreated(
				requestData.indexName,
			);

			const request = https.request(
				{
					method: isQuerySuggestionsCreated ? 'PUT' : 'POST',
					host: 'query-suggestions.us.algolia.com',
					path: `/1/configs${
						isQuerySuggestionsCreated ? `/${requestData.indexName}` : ''
					}`,
					headers: {
						'X-Algolia-Application-Id': appId,
						'X-Algolia-API-Key': apiKey,
					},
				},
				(res) => {
					res.on('data', (data) => {
						if (res.statusCode.toString().startsWith('2')) {
							this.success(
								`Query suggestions configuration for ${sourceIndex} completed`,
							);
						} else {
							this.warn(`[Algolia API Status Code]: ${res.statusCode}`);
							this.error(`Something wrong occurred: ${data}`);
						}
					});

					res.on('error', (error) => {
						this.error(`An error occurred: ${error}`);
					});
				},
			);

			request.write(JSON.stringify(requestData));
			request.end();
		}
	}

	/**
	 * Returns if a given query suggestions index exists
	 *
	 * @param {string} indexName The index name
	 * @returns {boolean} True if query suggestions index exists, false otherwise
	 */
	async isQuerySuggestionsCreated(indexName) {
		const { appId, apiKey } = Algolia.config;

		const request = new Promise((resolve, reject) => {
			https
				.request(
					{
						method: 'GET',
						host: 'query-suggestions.us.algolia.com',
						path: `/1/configs/${indexName}`,
						headers: {
							'X-Algolia-Application-Id': appId,
							'X-Algolia-API-Key': apiKey,
						},
					},
					(res) => {
						res.setEncoding('utf8');
						let dataChunk;

						res.on('data', (data) => {
							dataChunk = data;
						});

						res.on('end', () => {
							resolve(JSON.parse(dataChunk));
						});

						res.on('error', (error) => {
							reject(error);
						});
					},
				)
				.end();
		});

		const response = await request;
		return response.status !== 404;
	}
}

module.exports = AlgoliaIndex;
