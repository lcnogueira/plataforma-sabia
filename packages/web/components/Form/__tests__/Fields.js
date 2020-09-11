import React from 'react';
import { render, fireEvent, waitFor } from 'test-utils';
import { Form, InputField, TextField, SelectField, SwitchField, CheckBoxField } from '..';

const commonFieldsTests = [
	[`InputField`, InputField],
	[`TextField`, TextField],
	['SelectField', SelectField],
];

test.each(commonFieldsTests)(
	'%s renders properly and on submit shows validation errors',
	async (_, Comp) => {
		const onSubmit = jest.fn(() => {});
		const { container, findByText } = render(
			<Form onSubmit={onSubmit}>
				<Comp
					name="test-input"
					label="Test Input"
					type="text"
					help={<p>Help Text</p>}
					validation={{ required: true }}
				/>
			</Form>,
		);

		fireEvent.submit(container.querySelector('form'));
		await findByText('error:requiredField');
		// if validaton is not succesfull onSubmit must not be called
		expect(onSubmit).not.toHaveBeenCalled();
		expect(container).toMatchSnapshot();
	},
);

test.each(commonFieldsTests)('%s does not trigger validation if not required', async (_, Comp) => {
	const onSubmit = jest.fn(() => {});
	const { container } = render(
		<Form onSubmit={onSubmit}>
			<Comp
				name="test-input"
				label="Test Input"
				type="text"
				validation={{ required: false }}
			/>
		</Form>,
	);

	fireEvent.submit(container.querySelector('form'));
	await waitFor(() => expect(onSubmit).toHaveBeenCalled());

	expect(container).toMatchSnapshot();
});

test('SwitchField works as expected', () => {
	const { container } = render(
		<Form>
			<SwitchField name="test-input" label="Test Input" />
		</Form>,
	);

	expect(container).toMatchSnapshot();
	expect(container.querySelector('label[for=test-input]')).toHaveTextContent('common:no');
	fireEvent.click(container.querySelector('input'));
	expect(container.querySelector('label[for=test-input]')).toHaveTextContent('common:yes');
});

test('CheckBoxField works as expected', () => {
	const { container } = render(
		<Form>
			<CheckBoxField name="test-input" label="Test Input" />
		</Form>,
	);

	expect(container).toMatchSnapshot();
});
