import get from 'lodash.get';

/**
 * Calculates the distance between two provided dates (e.g.: "Five days ago")
 *
 * @param {Function} t The function to translate the description
 * @param {Date} previousDate Previous date
 * @param {Date} currentDate Current date
 * @returns {string} The description
 */
export const formatDistance = (t, previousDate, currentDate = new Date()) => {
	// Get timestamps
	const currentUnix = new Date(currentDate).getTime();
	const previousUnix = new Date(previousDate).getTime();
	if (!currentUnix || !previousUnix) return null;

	// Difference in milisseconds
	const elapsed = currentUnix - previousUnix;

	// Constants
	const minuteInMs = 60 * 1000;
	const hourInMs = minuteInMs * 60;
	const dayInMs = hourInMs * 24;
	const monthInMs = dayInMs * 30;
	const yearInMs = dayInMs * 365;

	let description;

	if (elapsed <= minuteInMs) {
		description = t('helper:formatDistance.second', { count: Math.floor(elapsed / 1000) });
	} else if (elapsed <= hourInMs) {
		description = t('helper:formatDistance.minute', {
			count: Math.floor(elapsed / minuteInMs),
		});
	} else if (elapsed <= dayInMs) {
		description = t('helper:formatDistance.hour', { count: Math.floor(elapsed / hourInMs) });
	} else if (elapsed < monthInMs) {
		description = t('helper:formatDistance.day', { count: Math.floor(elapsed / dayInMs) });
	} else if (elapsed < yearInMs) {
		description = t('helper:formatDistance.month', { count: Math.floor(elapsed / monthInMs) });
	} else {
		description = t('helper:formatDistance.year', { count: Math.floor(elapsed / yearInMs) });
	}

	return description;
};

/**
 * Format money to BRL
 *
 * @param {number} value Raw value
 * @returns {string}
 */
export const formatMoney = (value) => {
	return String(
		new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
	).replace(String.fromCharCode(160), String.fromCharCode(32));
};

/**
 * Sets a cookie
 *
 * @param {string} cname Cookie name.
 * @param {string} cvalue Cookie value.
 * @param {number} exdays Number of days before expiring.
 *
 * @returns {string} Cookie definition string.
 */
export const setCookie = (cname, cvalue, exdays = 4) => {
	if (typeof document === 'undefined') {
		return false;
	}

	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	const expires = `expires=${d.toGMTString()}`;

	const cookieDefinition = `${cname}=${cvalue};${expires};path=/`;

	document.cookie = cookieDefinition;

	return cookieDefinition;
};

/**
 * Returns a cookie value if defined.
 *
 * @param {string} cname Cookie name.
 *
 * @returns {string}
 */
export const getCookie = (cname) => {
	if (typeof document === 'undefined') {
		return false;
	}

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${cname}=`);

	if (parts.length === 2) {
		return parts
			.pop()
			.split(';')
			.shift();
	}

	return false;
};

/**
 * Normalizes a string by removing special characters.
 *
 * @param {string} s The string to be normalized
 * @returns {string} The normalized string.
 */
export const normalize = (s) =>
	s.normalize('NFD').replace(/[\u0300-\u036f|\u00b4|\u0060|\u005e|\u007e]/g, '');

/**
 * Truncates the text to the max provided amount of words.
 *
 * @param {string} text The text to be truncated
 * @param {number} maxSize Maximum amount of words should remain
 * @returns {string} The truncated text.
 */
export const truncateText = (text, maxSize) =>
	text
		.split(' ')
		.splice(0, maxSize)
		.join(' ')
		.concat('...');

/**
 * Outputs a description according to the number of provided days.
 *
 * @param {Function} t The function to translate the description.
 * @param {number} days The number of days.
 * @returns {string} The calculated description.
 */
export const getPeriod = (t, days) => {
	let description;

	const weeksInDays = 7;
	const monthsInDays = 30;
	const yearsInDays = 365;

	if (days < weeksInDays) {
		description = t('helper:getPeriod.day', { count: days });
	} else if (days < monthsInDays) {
		description = t('helper:getPeriod.week', { count: Math.floor(days / weeksInDays) });
	} else if (days < yearsInDays) {
		description = t('helper:getPeriod.month', { count: Math.floor(days / monthsInDays) });
	} else {
		description = t('helper:getPeriod.year', { count: Math.floor(days / yearsInDays) });
	}

	return description;
};

/**
 * Outputs the form validation error message
 *
 * @param {object} errors The react hook form errors object.
 * @param {string} name Field name
 * @param {Function} t The function to translate the terms.
 * @returns {string}
 */
export const validationErrorMessage = (errors, name, t) => {
	const errorObject = get(errors, name);
	const defaultValidationErrorMessages = {
		required: t('error:requiredField'),
	};
	return errorObject?.message || defaultValidationErrorMessages[errorObject?.type] || '';
};

/**
 * Maps an array of object to an array of select objects (To be used with <Select />)
 *
 * @param {Array} arrayOfObject Array of objects that will be transformed.
 * @param {string} labelKey Which property use as key.
 * @param {string} valueKey Which property use as value.
 *
 * @returns {object[]}
 */
export const mapArrayOfObjectToSelect = (arrayOfObject = [], labelKey, valueKey) => {
	return arrayOfObject.map((object) => ({
		label: object[labelKey],
		value: `${object[valueKey]}`,
	}));
};

/**
 * Unmask a field by returning only digits
 *
 * @param {string} field The field to be unmasked
 * @returns {string}
 */
export const unMask = (field) => field.replace(/\D/g, '');

/**
 * Turns a string date (brazilian format) into a JS Date.
 *
 * @param {string} stringDate The string to be turnet into data (e.g.: 31/05/1987)
 * @returns {Date}
 */
export const stringToDate = (stringDate) => {
	if (!stringDate) return '';
	const [day, month, year] = stringDate.split('/');
	return new Date(year, month - 1, day);
};

/**
 * Turns a string date into a formatted String.
 *
 * @param {string} date The date  (e.g.: 1987-05-31T03:00:00.000Z) to be turned into a formatted string
 * @returns {string}
 */
export const dateToString = (date) => {
	if (!date) return '';
	const [year, month, day] = date.split('-');
	return `${day.substring(0, 2)}/${month}/${year}`;
};
