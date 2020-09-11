import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = process.env.REACT_APP_API_URL;

const httpClient = (url, options = {}) => {
	const token = localStorage.getItem('token');
	const locale = localStorage.getItem('locale');
	const headers = new Headers({
		'Content-Type': 'application/json',
		'Accept-Language': locale,
		Authorization: token,
	});

	let upOptions = options;
	if (!options) {
		upOptions = { headers };
	} else {
		upOptions.headers = headers;
	}

	return fetchUtils.fetchJson(url, upOptions);
};

export default {
	getList: (resource, params) => {
		const { page, perPage } = params.pagination;
		const { field, order } = params.sort;
		const query = {
			page,
			perPage,
			order,
			orderBy: field,
		};
		const url = `${apiUrl}/${resource}?${stringify(query)}`;

		return httpClient(url).then(({ headers, json }) => {
			json.map((line) => {
				return Object.entries(line).forEach(([keyi, attr]) => {
					if (typeof attr === 'object' && attr) {
						const ids = [];
						Object.entries(attr).forEach(([keyj]) => {
							ids.push(line[keyi][keyj].id);
						});
						// eslint-disable-next-line no-param-reassign
						line[keyi] = ids;
					}
				});
			});

			return {
				headers,
				data: json,
				total: parseInt(headers.get('X-Sabia-Total'), 10),
			};
		});
	},

	getOne: (resource, params) =>
		httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => {
			Object.entries(json).forEach(([keyi, attr]) => {
				if (json[keyi] && typeof attr === 'object') {
					const ids = [];
					json[keyi].map((id) => ids.push(id.id));
					// eslint-disable-next-line no-param-reassign
					json[keyi] = ids;
				}
			});

			return { data: json };
		}),

	getMany: (resource, params) => {
		const query = params.ids;
		const url = `${apiUrl}/${resource}?perPage=999&ids=${query}`;
		return httpClient(url).then(({ json }) => {
			return { data: json };
		});
	},

	update: (resource, params) =>
		httpClient(`${apiUrl}/${resource}/${params.id}`, {
			method: 'PUT',
			body: JSON.stringify(params.data),
		}).then(({ json }) => ({ data: json })),

	create: (resource, params) =>
		httpClient(`${apiUrl}/${resource}`, {
			method: 'POST',
			body: JSON.stringify(params.data),
		}).then(({ json }) => ({
			data: { ...params.data, id: json.id },
		})),

	delete: (resource, params) =>
		httpClient(`${apiUrl}/${resource}/${params.id}`, {
			method: 'DELETE',
		}).then(({ json }) => ({ data: json })),
};
