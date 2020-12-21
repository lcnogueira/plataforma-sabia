import { apiPost, apiGet } from './api';
import { HEADER as apiHeaderEnum } from '../utils/enums/api.enum';

/**
 * Creates a technology order
 *
 * @param {string|number} id The technology ID
 * @returns {object} Order response
 */
export const buyTechnology = async (id, { quantity, use, funding, comment } = {}) => {
	if (!id || !quantity || !use || !funding) return false;

	const response = await apiPost(`technologies/${id}/orders`, {
		quantity,
		use,
		funding,
		comment,
	});

	if (response.status !== 200) return false;

	return response.data;
};

/**
 * Gets orders made to current user technologies
 *
 * @param {object} options Optional params
 */
export const getOrders = async (options) => {
	const response = await apiGet('orders', { ...options, embed: true });

	if (response.status !== 200) {
		return false;
	}

	const { data, headers } = response;

	const totalPages = Number(headers.get(apiHeaderEnum.TOTAL_PAGES) || 0);
	const totalItems = Number(headers.get(apiHeaderEnum.TOTAL_ITEMS) || 0);

	return { orders: data, totalPages, totalItems };
};

/**
 * Gets an order by id
 *
 * @param {string|number} id The order id
 * @param {object} options Optional params
 */
export const getOrder = async (id, options) => {
	if (!id) return false;

	const response = await apiGet(`orders/${id}`, { ...options, embed: true });

	if (response.status !== 200) return false;

	return response.data;
};