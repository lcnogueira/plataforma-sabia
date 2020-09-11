import {
	formatDistance,
	truncateText,
	normalize,
	getPeriod,
	validationErrorMessage,
	setCookie,
	getCookie,
	mapArrayOfObjectToSelect,
	unMask,
	stringToDate,
	dateToString,
	formatMoney,
} from '../helper';

test.each([
	[
		'January 1, 2020 00:00:00',
		'January 1, 2020 00:00:10',
		'helper:formatDistance.second',
		{ count: 10 },
	],
	[
		'January 1, 2020 00:00:00',
		'January 1, 2020 00:30:00',
		'helper:formatDistance.minute',
		{ count: 30 },
	],
	[
		'January 1, 2020 00:00:00',
		'January 1, 2020 02:00:00',
		'helper:formatDistance.hour',
		{ count: 2 },
	],
	[
		'January 1, 2020 00:00:00',
		'January 2, 2020 02:00:00',
		'helper:formatDistance.day',
		{ count: 1 },
	],
	[
		'January 1, 2020 00:00:00',
		'March 2, 2020 02:00:00',
		'helper:formatDistance.month',
		{ count: 2 },
	],
	[
		'January 1, 2019 00:00:00',
		'February 2, 2021 02:00:00',
		'helper:formatDistance.year',
		{ count: 2 },
	],
])('formatDistance(t, %s, %s)', (previousDate, currentDate, slug, count) => {
	const t = jest.fn();
	formatDistance(t, previousDate, currentDate);
	expect(t).toHaveBeenCalledWith(slug, count);
});

test('truncate text works', () => {
	expect(truncateText('Lorem Ipsum Dolor Sit Amet', 2)).toBe('Lorem Ipsum...');
	expect(truncateText('Lorem Ipsum Dolor Sit Amet', 10)).toBe('Lorem Ipsum Dolor Sit Amet...');
});

test.each([
	[1, 'helper:getPeriod.day', { count: 1 }],
	[7, 'helper:getPeriod.week', { count: 1 }],
	[14, 'helper:getPeriod.week', { count: 2 }],
	[35, 'helper:getPeriod.month', { count: 1 }],
	[60, 'helper:getPeriod.month', { count: 2 }],
	[390, 'helper:getPeriod.year', { count: 1 }],
	[730, 'helper:getPeriod.year', { count: 2 }],
])('getPeriod(t, %d)', (days, slug, count) => {
	const t = jest.fn();
	getPeriod(t, days);
	expect(t).toHaveBeenCalledWith(slug, count);
});

test('normalize string works', () => {
	const string = 'éééé ááááá ãõê````';
	expect(normalize(string)).toBe('eeee aaaaa aoe');
	expect(normalize(string)).not.toBe(string);
});

test('validationErrorMessage works', () => {
	const defaultErrorMessage = 'default error message';
	const t = () => defaultErrorMessage;
	expect(validationErrorMessage({ field: { type: 'required' } }, 'field', t)).toBe(
		defaultErrorMessage,
	);
	expect(
		validationErrorMessage(
			{ field: { type: 'required', message: 'custom error message' } },
			'field',
			t,
		),
	).toBe('custom error message');
});

test('setCookie', () => {
	const getExpiration = (days) => {
		const d = new Date();
		d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
		return d.toGMTString();
	};
	let cookieDefinition = setCookie('testCookie', 'testValue');

	expect(cookieDefinition).toEqual(expect.stringMatching(/testCookie=testValue;(.*)path=\//));

	cookieDefinition = setCookie('testCookie2', 'testValue', 10);
	expect(cookieDefinition).toEqual(`testCookie2=testValue;expires=${getExpiration(10)};path=/`);
	cookieDefinition = setCookie('testCookie3', 'testValue', 1);
	expect(cookieDefinition).toEqual(`testCookie3=testValue;expires=${getExpiration(1)};path=/`);
});

test('getCookie', () => {
	setCookie('testCookie', 'testValue');
	expect(getCookie('testCookie')).toEqual('testValue');

	setCookie('testCookie2', 'testValue2');
	expect(getCookie('testCookie2')).toEqual('testValue2');
});

test('mapArrayOfObjectToSelect', () => {
	expect(
		mapArrayOfObjectToSelect(
			[
				{ term: 'term 1', slug: 'term-1' },
				{ term: 'term 3', slug: 'term-3' },
			],
			'term',
			'slug',
		),
	).toEqual([
		{ label: 'term 1', value: 'term-1' },
		{ label: 'term 3', value: 'term-3' },
	]);
});

test('unMask', () => {
	expect(unMask('59655-000')).toBe('59655000');
	expect(unMask('123.456.890-90')).toBe('12345689090');
	expect(typeof unMask('123.456.890-90')).toBe('string');
});

test('stringToDate', () => {
	expect(stringToDate()).toBe('');
	expect(stringToDate('')).toBe('');
	expect(stringToDate(null)).toBe('');

	const mockDate = '1987-05-31T03:00:00.000Z';
	jest.spyOn(global, 'Date').mockImplementationOnce(() => new Date(mockDate));
	expect(stringToDate('31/05/1987')).toEqual(new Date(mockDate));
});

test('dateToString', () => {
	expect(dateToString()).toBe('');
	expect(dateToString('')).toBe('');
	expect(dateToString(null)).toBe('');
	expect(dateToString('1987-05-31T03:00:00.000Z')).toBe('31/05/1987');
});

test.each([
	[2.5, 'R$ 2,50'],
	[2, 'R$ 2,00'],
])('formatMoney(%s)', (value, result) => {
	const formatted = formatMoney(value);
	expect(formatted).toEqual(result);
});
