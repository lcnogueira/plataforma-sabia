/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const StyledInput = styled.input`
	width: 100%;
	height: 5rem;
	font: 1.2em sans-serif;
	margin: 0.5rem 0;
	padding: 1rem;
	background: none;
	border: 1px solid ${({ theme }) => theme.colors.mediumGray};
	border-radius: 0.5rem;
	color: ${({ theme }) => theme.colors.mediumGray};
`;

const InputField = ({ name, form, type, label, validation, ...inputProps }) => {
	const { register, errors } = form;

	return (
		<div>
			<label htmlFor={name}>{label}</label>

			<StyledInput
				id={name}
				type={type}
				name={name}
				aria-label={label}
				aria-required={validation.required}
				ref={register(validation)}
				{...inputProps}
			/>
			<span>{errors[name]?.message}</span>
		</div>
	);
};

InputField.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	type: PropTypes.string,
	form: PropTypes.shape({
		register: PropTypes.func,
		errors: PropTypes.shape({}),
	}).isRequired,
	/**
	 * @see https://react-hook-form.com/api#register
	 */
	validation: PropTypes.shape({
		required: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	}),
};

InputField.defaultProps = {
	type: 'text',
	validation: {},
};

export default InputField;
