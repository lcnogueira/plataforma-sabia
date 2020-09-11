import React from 'react';
import { render } from 'test-utils';
import MyAccount from '../../../../pages/user/my-account';

test('it renders MyAccount main page correctly', () => {
	const { container } = render(<MyAccount />);

	expect(container).toMatchSnapshot();
});
