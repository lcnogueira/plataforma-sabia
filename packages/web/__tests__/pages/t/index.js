import React from 'react';
import { render, screen, fireEvent } from 'test-utils';
import Page from '../../../pages/t/[technology]';
import Tabs from '../../../components/Technology/Details/Tabs';
import { getFakeTechnology, normalizeAttachments } from '../../../utils/technology';
import * as useAuth from '../../../hooks/useAuth';

let technology = getFakeTechnology();

technology = {
	...technology,
	attachments: normalizeAttachments(technology.attachments),
};

describe('Technology Details Page', () => {
	const tabs = ['about', 'description', 'review', 'costs', 'attachments'];

	beforeAll(() => {
		Tabs.getInitialProps();
	});

	test.each([
		['logged in', 'test@test.com'],
		['not logged in', null],
	])('render correctly when user is %s', (_, email) => {
		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email,
			},
		});

		const { container } = render(
			<Page technology={technology} relatedTechnologies={[technology]} />,
		);

		tabs.forEach((tab) => {
			const item = screen.getByTestId(tab);
			fireEvent.click(item);
		});

		expect(container).toMatchSnapshot();
	});
});
