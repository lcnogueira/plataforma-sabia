import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledCheckBox = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 1rem;
	font: 1.2rem;
`;

const StyledCheckBoxInput = styled.input`
	margin: 0rem;
	opacity: 0;
	visibility: hidden;
	display: none;
	width: 1px;
	position: relative;
	left: 2.5rem;

	&:checked + span {
		background: ${({ theme }) => theme.colors.blue} -19px top no-repeat;
		border-color: ${({ theme }) => theme.colors.blue};

		&:before {
			content: '';
			position: absolute;
			top: 16%;
			right: 34%;
			display: inline-block;
			transform: rotate(45deg);
			height: 12px;
			width: 7px;
			border-bottom: 3px solid ${({ theme }) => theme.colors.white};
			border-right: 3px solid ${({ theme }) => theme.colors.white};
		}
	}
`;

const StyledCheckBoxLabel = styled.label.attrs(({ htmlFor }) => ({
	htmlFor,
}))`
	width: 100%;
	color: ${({ theme }) => theme.colors.lightGray};
	cursor: pointer;
`;

const StyledCheckBoxMark = styled.span`
	display: inline-block;
	position: relative;
	top: -1px;
	width: 2.5rem;
	height: 2.5rem;
	margin: -1px 0px 0 0;
	margin-right: 8px;
	vertical-align: middle;
	background: ${({ theme }) => theme.colors.white};
	border: 1px solid ${({ theme: { colors } }) => colors.mediumGray};
	border-radius: 0.2rem;
	cursor: pointer;
`;

const CheckBoxField = ({ name, value, label, required, onChange }) => {
	const handleOnChange = () => onChange((oldValue) => !oldValue);
	return (
		<StyledCheckBox>
			<StyledCheckBoxInput
				id={name}
				name={name}
				type="checkbox"
				aria-label={label}
				aria-required={required}
				required={required}
				checked={value}
				onChange={handleOnChange}
			/>
			<StyledCheckBoxMark
				onClick={handleOnChange}
				role="checkbox"
				aria-label={label}
				aria-required={required}
				aria-checked={value}
				tabindex="0"
			/>
			<StyledCheckBoxLabel htmlFor={name}>{label}</StyledCheckBoxLabel>
		</StyledCheckBox>
	);
};
CheckBoxField.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.bool,
	label: PropTypes.string,
	required: PropTypes.bool,
	onChange: PropTypes.func,
};

CheckBoxField.defaultProps = {
	value: false,
	label: '',
	required: false,
	onChange: () => {},
};

export default CheckBoxField;
