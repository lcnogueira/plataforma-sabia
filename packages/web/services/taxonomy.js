import { apiGet } from './api';

// eslint-disable-next-line import/prefer-default-export
export const getTaxonomies = async (
	options = { embed: false, children: false, normalize: true },
) => {
	let endpoint = 'taxonomies';

	if (options.embed === true) {
		endpoint = `${endpoint}`;
	}

	const response = await apiGet(endpoint, {
		embed: options.embed,
		parent: options.parent === false ? 0 : options.parent,
	});

	if (response.status !== 200) {
		return false;
	}

	const { data } = response;

	if (options.normalize !== true) {
		return data;
	}

	const taxonomies = {};
	data.forEach(({ taxonomy, ...fields }) => {
		taxonomies[taxonomy.toLowerCase()] = fields;
	});

	return taxonomies;
};
