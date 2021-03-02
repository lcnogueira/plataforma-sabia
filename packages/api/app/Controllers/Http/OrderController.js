const Technology = use('App/Models/Technology');
const TechnologyOrder = use('App/Models/TechnologyOrder');
const ServiceOrder = use('App/Models/ServiceOrder');
const Permission = use('App/Models/Permission');
const ServiceOrderReview = use('App/Models/ServiceOrderReview');
const User = use('App/Models/User');
const {
	orderStatuses,
	serviceOrderStatuses,
	errorPayload,
	errors,
	getTransaction,
	permissions,
} = require('../../Utils');

const {
	LIST_TECHNOLOGIES_ORDERS: { permission: listTechnologiesOrdersPermission },
	LIST_SERVICES_ORDERS: { permission: listServicesOrdersPermission },
} = permissions;

const Bull = use('Rocketseat/Bull');
const SendMailJob = use('App/Jobs/SendMail');

class OrderController {
	async showTechnologyOrders({ params, request, auth }) {
		const technologyInst = await Technology.findOrFail(params.id);
		const loggedUser = await auth.getUser();
		const technologyOrderQuery = TechnologyOrder.query()
			.where('technology_id', technologyInst.id)
			.with('technology', (technology) =>
				technology.select('id').with('users', (users) => users.select('id')),
			)
			.with('technology.users')
			.with('technology.thumbnail');

		const canListTechnologiesOrders = await Permission.checkPermission(
			loggedUser,
			[listTechnologiesOrdersPermission],
			{ id: 0 },
		);

		if (!canListTechnologiesOrders) {
			technologyOrderQuery.whereHas('technology', (builder) => {
				builder.whereHas('users', (userQuery) => {
					userQuery.where('id', loggedUser.id);
					userQuery.where('role', 'OWNER');
				});
			});
		}

		return technologyOrderQuery.withFilters(request).withParams(request, { filterById: false });
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

	/** Lists orders in buyer and seller view */
	/** If fromCurrentUser == true => buyer view, otherwise seller */
	async index({ request, auth }) {
		const { fromCurrentUser = false } = request.all();

		const technologyOrderQuery = TechnologyOrder.query()
			.with('technology', (technology) =>
				technology.select('id').with('users', (users) => users.select('id')),
			)
			.with('technology.users')
			.with('technology.thumbnail');

		const serviceOrderQuery = ServiceOrder.query()
			.with('user')
			.with('service.user');

		const loggedUser = await auth.getUser();
		if (fromCurrentUser === 'true' || fromCurrentUser === '') {
			technologyOrderQuery.where({ user_id: loggedUser.id });
			serviceOrderQuery.where({ user_id: loggedUser.id });
		} else {
			// Verify if user has permission to view all technology orders
			const canListTechnologiesOrders = await Permission.checkPermission(
				loggedUser,
				[listTechnologiesOrdersPermission],
				{ id: 0 },
			);

			if (!canListTechnologiesOrders) {
				technologyOrderQuery.whereHas('technology', (builder) => {
					builder.whereHas('users', (userQuery) => {
						userQuery.where('id', loggedUser.id);
						userQuery.where('role', 'OWNER');
					});
				});
			}

			// Verify if user has permission to view all service orders
			const canListServicesOrders = await Permission.checkPermission(
				loggedUser,
				[listServicesOrdersPermission],
				{ id: 0 },
			);

			if (!canListServicesOrders) {
				serviceOrderQuery.whereHas('service', (builder) => {
					builder.where({ user_id: loggedUser.id });
				});
			}
		}

		const technologyOrders = await technologyOrderQuery
			.withFilters(request)
			.withParams(request, { filterById: true });
		const serviceOrders = await serviceOrderQuery.withParams(request);

		return [...technologyOrders.toJSON(), ...serviceOrders.toJSON()];
	}

	async show({ request, auth, params }) {
		const loggedUser = await auth.getUser();
		const technologyOrderQuery = TechnologyOrder.query()
			.where({ id: params.id })
			.with('technology', (technology) =>
				technology.select('id').with('users', (users) => users.select('id')),
			)
			.with('technology.users')
			.with('technology.thumbnail');

		const canListTechnologiesOrders = await Permission.checkPermission(
			loggedUser,
			[listTechnologiesOrdersPermission],
			{ id: 0 },
		);

		if (!canListTechnologiesOrders) {
			technologyOrderQuery
				.where({ user_id: loggedUser.id })
				.orWhereHas('technology', (builder) => {
					builder.whereHas('users', (userQuery) => {
						userQuery.where('id', loggedUser.id);
						userQuery.where('role', 'OWNER');
					});
				});
		}

		return technologyOrderQuery.withFilters(request).withParams(request);
	}

	async updateStatus({ params, request }) {
		const order = await TechnologyOrder.findOrFail(params.id);
		const data = request.only(['status']);
		order.merge(data);
		await order.save();
		return order;
	}

	async updateServiceOrder({ params, request }) {
		const { quantity, comment } = request.all();
		const serviceOrder = await ServiceOrder.findOrFail(params.id);
		serviceOrder.merge({ quantity, comment });
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

	sendEmailToResearcher(researcher, technology, antl) {
		const mailData = {
			email: researcher.email,
			subject: antl('message.researcher.technologyOrder'),
			template: 'emails.technology-order',
			researcher,
			technology,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });
	}

	async storeTechnologyOrder({ auth, params, request }) {
		const technology = await Technology.findOrFail(params.id);
		let technologyOrder;
		let trx;

		try {
			const { init, commit } = getTransaction();
			trx = await init();

			const data = request.only(['quantity', 'use', 'funding', 'comment']);
			technologyOrder = await TechnologyOrder.create(
				{ ...data, status: orderStatuses.OPEN },
				trx,
			);

			const user = await auth.getUser();
			await Promise.all([
				technologyOrder.technology().associate(technology, trx),
				technologyOrder.user().associate(user, trx),
			]);
			await commit();
		} catch (error) {
			trx.rollback();
			throw error;
		}
		const researcher = await technology.getOwner();
		this.sendEmailToResearcher(researcher, technology, request.antl);
		return technologyOrder;
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
		const { services, comment } = request.all();
		const user = await auth.getUser();
		const servicesList = services.map((service) => ({
			service_id: service.service_id,
			quantity: service.quantity,
			user_id: user.id,
			status: serviceOrderStatuses.REQUESTED,
			comment,
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

	/**
	 * Close TechnologyOrder.
	 * PUT orders/:id/close
	 */
	async closeTechnologyOrder({ params, request, response }) {
		const data = request.only(['unit_value', 'quantity']);
		const order = await TechnologyOrder.findOrFail(params.id);
		if (order.status !== orderStatuses.OPEN) {
			return response.status(400).send(
				errorPayload(
					errors.STATUS_NO_ALLOWED_FOR_OPERATION,
					request.antl('error.operation.statusNoAllowedForOperation', {
						op: 'CLOSE ORDER',
						status: order.status,
					}),
				),
			);
		}
		order.status = orderStatuses.CLOSED;
		order.merge(data);
		await order.save();
		const buyer = await order.user().first();
		const technology = await order.technology().first();
		const unitValueFormated = new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(order.unit_value);
		const { quantity } = order;
		const mailData = {
			email: buyer.email,
			subject: request.antl('message.order.technologyOrderClosed'),
			template: 'emails.technology-order-closed',
			buyer,
			technology,
			quantity,
			unitValueFormated,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });
		return order.toJSON();
	}

	/**
	 * Cancel TechnologyOrder.
	 * PUT orders/:id/cancel
	 */
	async cancelTechnologyOrder({ params, request, response, auth }) {
		const { cancellation_reason } = request.all();
		const order = await TechnologyOrder.findOrFail(params.id);
		if (order.status !== orderStatuses.OPEN) {
			return response.status(400).send(
				errorPayload(
					errors.STATUS_NO_ALLOWED_FOR_OPERATION,
					request.antl('error.operation.statusNoAllowedForOperation', {
						op: 'CANCEL ORDER',
						status: order.status,
					}),
				),
			);
		}
		order.status = orderStatuses.CANCELED;
		order.merge({ cancellation_reason });
		await order.save();
		const buyer = await order.user().first();
		const technology = await order.technology().first();
		const owner = await technology.getOwner();
		const loggedUser = await auth.getUser();
		const isCancelledByBuyer = loggedUser.id === order.user_id;
		const mailData = {
			email: isCancelledByBuyer ? owner.email : buyer.email,
			subject: request.antl('message.order.technologyOrderCancelled'),
			template: 'emails.technology-order-cancelled',
			full_name: isCancelledByBuyer ? owner.getFullName(owner) : buyer.getFullName(buyer),
			title: technology.title,
			cancelledBy: isCancelledByBuyer ? 'buyer' : 'seller',
			cancellation_reason,
		};
		Bull.add(SendMailJob.key, mailData, { attempts: 3 });
		return order.toJSON();
	}

	async performServiceOrder({ params }) {
		const serviceOrder = await ServiceOrder.findOrFail(params.id);
		serviceOrder.status = serviceOrderStatuses.PERFORMED;
		await serviceOrder.save();
		return serviceOrder;
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

module.exports = OrderController;
