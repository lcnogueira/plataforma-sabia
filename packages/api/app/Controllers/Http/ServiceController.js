const Service = use('App/Models/Service');
const ServiceOrder = use('App/Models/ServiceOrder');
const ServiceOrderReview = use('App/Models/ServiceOrderReview');
const Term = use('App/Models/Term');
const User = use('App/Models/User');

const { getTransaction, errorPayload, errors, serviceOrderStatuses } = require('../../Utils');

const Bull = use('Rocketseat/Bull');
const SendMailJob = use('App/Jobs/SendMail');

class ServiceController {
	async index({ request }) {
		const filters = request.all();
		return Service.query()
			.with('keywords')
			.with('user.institution')
			.withFilters(filters)
			.withParams(request);
	}

	async show({ request }) {
		return Service.query()
			.with('keywords')
			.with('user.institution')
			.withParams(request);
	}

	async showServiceOrders({ auth, request }) {
		const serviceResponsible = await auth.getUser();
		const serviceOrders = ServiceOrder.query()
			.whereHas('service', (builder) => {
				builder.where({ user_id: serviceResponsible.id });
			})
			.with('service')
			.withParams(request);
		return serviceOrders;
	}

	async showServiceOrderReviews({ auth, request }) {
		const serviceResponsible = await auth.getUser();
		const serviceOrderReviews = ServiceOrderReview.query()
			.whereHas('serviceOrder', (builder) => {
				builder.whereHas('service', (builder2) => {
					builder2.where({ user_id: serviceResponsible.id });
				});
			})
			.with('serviceOrder.service')
			.withParams(request);
		return serviceOrderReviews;
	}

	async syncronizeKeywords(trx, keywords, service, detach = false) {
		const keywordInstances = await Promise.all(
			keywords.map((keyword) => Term.getTerm(keyword)),
		);
		if (detach) {
			await service.keywords().detach(null, null, trx);
		}

		await service.keywords().attach(
			keywordInstances.map((keyword) => keyword.id),
			null,
			trx,
		);
	}

	async store({ auth, request, response }) {
		const { name, description, type, price, measure_unit, keywords } = request.all();
		const serviceResponsible = await auth.getUser();
		if (!serviceResponsible.institution_id) {
			return response
				.status(400)
				.send(
					errorPayload(
						errors.USER_WITHOUT_INSTITUTION,
						request.antl('error.user.withoutInstitution'),
					),
				);
		}
		let service;
		let trx;
		try {
			const { init, commit } = getTransaction();
			trx = await init();

			service = await Service.create(
				{
					name,
					description,
					type,
					price,
					measure_unit,
				},
				trx,
			);
			await service.user().associate(serviceResponsible, trx);
			if (keywords) {
				await this.syncronizeKeywords(trx, keywords, service);
			}
			await service.load('keywords');
			await commit();
		} catch (error) {
			await trx.rollback();
			throw error;
		}

		return service;
	}

	/**
	 * Send emails to the users responsible for services.
	 *
	 * @param {Array} serviceOrders Service Orders
	 * @param {Function} antl Function to translate the messages
	 */
	async sendEmailsToResponsibles(serviceOrders, antl) {
		await Promise.all(
			serviceOrders.map(async (serviceOrder) => {
				await serviceOrder.load('service');
				const responsible = await User.findOrFail(serviceOrder.toJSON().service.user_id);
				const mailData = {
					email: responsible.email,
					subject: antl('message.service.serviceRequested'),
					template: 'emails.service-requested',
					responsible,
					serviceOrder,
				};
				Bull.add(SendMailJob.key, mailData, { attempts: 3 });
			}),
		);
	}

	async storeServiceOrder({ auth, request }) {
		const { services } = request.all();
		const user = await auth.getUser();
		const servicesList = services.map((service) => ({
			service_id: service.service_id,
			quantity: service.quantity,
			user_id: user.id,
			status: serviceOrderStatuses.REQUESTED,
		}));
		const serviceOrders = await user.serviceOrders().createMany(servicesList);
		await this.sendEmailsToResponsibles(serviceOrders, request.antl);
		return serviceOrders;
	}

	async storeServiceOrderReview({ request, params, auth }) {
		const data = request.only(['content', 'rating', 'positive', 'negative']);

		const review = {
			content: data.content,
			rating: data.rating,
			positive: JSON.stringify(data.positive),
			negative: JSON.stringify(data.negative),
		};

		const [serviceOrder, user] = await Promise.all([
			ServiceOrder.findOrFail(params.id),
			auth.getUser(),
		]);

		let serviceOrderReview;
		let trx;

		try {
			const { init, commit } = getTransaction();
			trx = await init();

			serviceOrderReview = await ServiceOrderReview.create(review, trx);
			await Promise.all([
				serviceOrderReview.serviceOrder().associate(serviceOrder, trx),
				serviceOrderReview.user().associate(user, trx),
			]);

			await commit();
		} catch (error) {
			await trx.rollback();
			throw error;
		}

		return serviceOrderReview.toJSON();
	}

	async update({ params, request }) {
		const data = request.only(['name', 'description', 'type', 'price', 'measure_unit']);
		const service = await Service.findOrFail(params.id);
		service.merge(data);
		let trx;
		try {
			const { init, commit } = getTransaction();
			trx = await init();

			await service.save(trx);

			const { keywords } = request.only(['keywords']);
			if (keywords) {
				await this.syncronizeKeywords(trx, keywords, service, true);
			}
			await service.load('keywords');
			await commit();
		} catch (error) {
			await trx.rollback();
			throw error;
		}

		return service;
	}

	async updateServiceOrder({ params, request }) {
		const { quantity } = request.all();
		const serviceOrder = await ServiceOrder.findOrFail(params.id);
		serviceOrder.merge({ quantity });
		await serviceOrder.save();
		return serviceOrder;
	}

	async performServiceOrder({ params }) {
		const serviceOrder = await ServiceOrder.findOrFail(params.id);
		serviceOrder.status = serviceOrderStatuses.PERFORMED;
		await serviceOrder.save();
		return serviceOrder;
	}

	async updateServiceOrderReview({ params, request }) {
		const data = request.only(['content', 'rating', 'positive', 'negative']);
		const review = {
			content: data.content,
			rating: data.rating,
			positive: JSON.stringify(data.positive),
			negative: JSON.stringify(data.negative),
		};
		const updatedServiceOrderReview = await ServiceOrderReview.findOrFail(params.id);
		updatedServiceOrderReview.merge(review);
		await updatedServiceOrderReview.save();
		return updatedServiceOrderReview.toJSON();
	}

	async destroy({ params, request, response }) {
		const service = await Service.findOrFail(params.id);
		// detaches related entities
		await service.keywords().detach();
		const result = await service.delete();
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

	async destroyServiceOrder({ params, request, response }) {
		const serviceOrder = await ServiceOrder.findOrFail(params.id);
		const result = await serviceOrder.delete();
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

	async destroyServiceOrderReview({ params, request, response }) {
		const serviceOrderReview = await ServiceOrderReview.findOrFail(params.id);
		const result = await serviceOrderReview.delete();
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
}

module.exports = ServiceController;