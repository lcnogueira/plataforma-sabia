import React from 'react';
import { render } from 'test-utils';
import Rating from '..';

describe('Rating component', () => {
	it('render correctly', () => {
		const { container } = render(<Rating />);

		expect(container).toMatchSnapshot();
	});

	it('render with a custom size', () => {
		const { container } = render(<Rating size={2} />);

		expect(container).toMatchSnapshot();
	});
});
