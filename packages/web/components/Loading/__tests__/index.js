import React from 'react';
import { render, screen } from 'test-utils';
import Loading from '..';

describe('Loading component', () => {
	const childrenText = 'hi';

	// eslint-disable-next-line react/prop-types
	const Component = ({ loading }) => (
		<Loading loading={loading}>
			<h1>{childrenText}</h1>
		</Loading>
	);

	it('renders loading or children correctly', async () => {
		const { container, rerender } = await render(<Component loading={false} />);

		expect(screen.queryByRole('heading')).toHaveTextContent(childrenText);
		expect(container).toMatchSnapshot();

		await rerender(<Component loading />);

		expect(screen.queryByRole('heading')).toBeFalsy();
		expect(container).toMatchSnapshot();
	});

	it('renders another variants', () => {
		const { container, rerender } = render(
			<Loading variant="secondary">
				<h1>{childrenText}</h1>
			</Loading>,
		);

		rerender(
			<Loading variant="white">
				<h1>{childrenText}</h1>
			</Loading>,
		);

		expect(container).toMatchSnapshot();
	});
});
