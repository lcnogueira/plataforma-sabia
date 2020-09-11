import React from 'react';
import { render, screen, fireEvent, waitFor } from 'test-utils';
import Costs from '..';
import { Form } from '../../../Form';

jest.mock('react-icons/fa', () => {
	return {
		__esModule: true,
		FaPlus: () => {
			return <svg>FaPlus mocked</svg>;
		},
		FaMinus: () => {
			return <svg>FaMinus mocked</svg>;
		},
	};
});

const onSubmit = jest.fn(() => {});

test('it render the Costs page', () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<Costs />
		</Form>,
	);

	expect(container).toMatchSnapshot();
});

test('it shows the funding fields when selecting funding as required', async () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<Costs />
		</Form>,
	);

	const label = screen.getByLabelText('common:no');

	fireEvent.click(label);

	await waitFor(() => screen.getByText('Valor do Financiamento'));

	expect(container).toMatchSnapshot();
});

test('it add one row when clicking the add button', async () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<Costs />
		</Form>,
	);

	const buttons = screen.getAllByRole('button');

	fireEvent.click(buttons[0]);

	await waitFor(() => screen.getByPlaceholderText('Descrição'));

	expect(container).toMatchSnapshot();
});
