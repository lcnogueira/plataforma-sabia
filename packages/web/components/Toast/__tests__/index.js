import React from 'react';
import { render } from 'test-utils';
import { ToastContainer } from '..';

describe('ToastContainer component', () => {
	it('render correctly', () => {
		const { container } = render(<ToastContainer />);

		expect(container).toMatchSnapshot();
	});
});
