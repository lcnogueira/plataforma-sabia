const slugify = require('slugify');

const Hash = use('Hash');
const Database = use('Database');

const incrementSlugSuffix = (oldSlug) => {
	const slugSplitted = oldSlug.split('-');
	const lastElementIndex = slugSplitted.length - 1;
	const isLastElementNumber = Number.isInteger(Number(slugSplitted[lastElementIndex]));

	if (isLastElementNumber) {
		slugSplitted[lastElementIndex] = parseInt(slugSplitted[lastElementIndex], 10) + 1;
	} else {
		slugSplitted.push(1);
	}

	return slugSplitted.join('-');
};

const createUniqueSlug = async (
	model,
	propertyToBeSlugfied,
	slugColumn = 'slug',
	replacement = '-',
) => {
	const slug = slugify(propertyToBeSlugfied, {
		replacement,
		lower: true,
		remove: /[*+~.()'"!:@]/g,
	});

	const slugStoredPreviously = await model
		.query()
		.where(slugColumn, 'LIKE', `${slug}%`)
		.orderByRaw(`substring(${slugColumn},length('${slug}-'))*1`)
		.first();

	if (slugStoredPreviously) {
		return incrementSlugSuffix(slugStoredPreviously.slug);
	}

	return slug;
};

const createTermSlug = async (term, taxonomy_id) => {
	const slug = slugify(term, { lower: true, remove: /[*+~.()'"!:@]/g });
	const taxonomy = await Database.table('taxonomies')
		.where({ id: taxonomy_id })
		.first();
	const taxonomyPrefix = taxonomy.taxonomy.toLowerCase();
	return `${taxonomyPrefix}-${slug}`;
};

const makeSafeHash = async (plain) => {
	let hashed = await Hash.make(plain);

	if (hashed.includes('/')) {
		hashed = await makeSafeHash(plain);
	}

	return hashed;
};

module.exports = {
	createUniqueSlug,
	incrementSlugSuffix,
	createTermSlug,
	makeSafeHash,
};
