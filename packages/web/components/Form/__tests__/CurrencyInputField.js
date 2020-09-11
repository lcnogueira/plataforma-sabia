import React from 'react';
import { render, screen, fireEvent } from 'test-utils';
import CurrencyInputField from '../CurrencyInputField';
import { Form } from '../Form';

const onSubmit = jest.fn();

test('CurrencyInputField works as expected if required props are provided', () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<CurrencyInputField
				label="Preço"
				name="price"
				placeholder="R$"
				validation={{ required: true }}
			/>
		</Form>,
	);

	expect(container).toMatchSnapshot();
});

test('it renders the value correctly if the default value is provided', () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<CurrencyInputField
				label="Preço"
				name="price"
				placeholder="R$"
				defaultValue="1000,50"
				validation={{ required: true }}
			/>
		</Form>,
	);

	expect(screen.getByLabelText('Preço')).toHaveValue('R$ 1.000,50');
	expect(container).toMatchSnapshot();
});

test('it does not render a value if the typed value is invalid ', () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<CurrencyInputField
				label="Preço"
				name="price"
				placeholder="R$"
				validation={{ required: true }}
			/>
		</Form>,
	);

	const input = screen.getByPlaceholderText('R$');

	fireEvent.change(input, { target: { value: 'Wrong Value!' } });

	expect(input.value).toBe('');
	expect(container).toMatchSnapshot();
});

test('it renders a value if the typed value is valid ', () => {
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<CurrencyInputField
				label="Preço"
				name="price"
				placeholder="R$"
				validation={{ required: true }}
			/>
		</Form>,
	);

	const input = screen.getByPlaceholderText('R$');

	fireEvent.change(input, { target: { value: '150' } });

	expect(input.value).toBe('R$ 150');
	expect(container).toMatchSnapshot();
});

test('it shows validation error on submit if the value is invalid', async () => {
	const { container, findByText } = render(
		<Form data-testid="form-currency-test" onSubmit={onSubmit}>
			<CurrencyInputField
				label="Preço"
				name="price"
				placeholder="R$"
				validation={{ required: true }}
			/>
		</Form>,
	);

	const input = screen.getByPlaceholderText('R$');
	fireEvent.change(input, { target: { value: '' } });
	fireEvent.submit(screen.getByTestId('form-currency-test'));

	await findByText('error:requiredField');
	expect(onSubmit).not.toHaveBeenCalled();
	expect(container).toMatchSnapshot();
});
