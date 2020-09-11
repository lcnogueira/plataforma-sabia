/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { InputLabel, Row } from './styles';
import Help from './Help';

const SWITCH_WIDTH = '80px';
const SWITCH_HEIGHT = '40px';

const SwitchContainer = styled.div`
	margin: 0.5rem 0 1rem 0;
`;

const SwitchInput = styled.input`
	height: 0;
	width: 0;
	visibility: hidden;

	&:checked + div label > span {
		left: calc(100% - 2px);
		transform: translateX(-100%);
	}
`;

const SwitchLabel = styled.label`
	width: ${SWITCH_WIDTH};
	height: ${SWITCH_HEIGHT};
	margin-top: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: ${({ checked }) => (checked ? 'flex-start' : 'flex-end')};
	cursor: pointer;
	background: white;
	border-radius: ${SWITCH_WIDTH};
	border: 2px solid
		${({ checked, theme }) => (checked ? theme.colors.secondary : theme.colors.blue)};
	position: relative;
	transition: color background-color 0.5s;

	> p {
		color: ${({ checked, theme }) => (checked ? theme.colors.secondary : theme.colors.blue)};
		padding: 0.5em;
		font-size: 0.8em;
		font-weight: 700;
		text-transform: uppercase;
	}

	> span {
		content: '';
		position: absolute;
		top: 1px;
		left: 2px;
		width: calc(${SWITCH_HEIGHT} - 6px);
		height: calc(${SWITCH_HEIGHT} - 6px);
		border-radius: calc(${SWITCH_HEIGHT} - 5px);
		transition: 0.2s;
		background: ${({ checked, theme }) =>
			checked ? theme.colors.secondary : theme.colors.blue};
		box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);
	}

	&:active span {
		width: calc(${SWITCH_HEIGHT} + 10px);
	}
`;

const SwitchLabelWrapper = styled.div`
	display: flex;
	align-items: center;
`;

const SwitchField = ({ label, form, name, help, validation, ...checkboxProps }) => {
	const { t } = useTranslation();
	const { register, watch } = form;
	const isChecked = watch(name);

	return (
		<SwitchContainer>
			<InputLabel>{label}</InputLabel>
			<SwitchInput
				type="checkbox"
				id={name}
				name={name}
				ref={register(validation)}
				{...checkboxProps}
			/>
			<Row>
				<SwitchLabelWrapper>
					<SwitchLabel htmlFor={name} checked={isChecked}>
						<p>{isChecked ? t('common:yes') : t('common:no')}</p>
						<span />
					</SwitchLabel>
					{help && <Help id={name} HelpComponent={help} />}
				</SwitchLabelWrapper>
			</Row>
		</SwitchContainer>
	);
};

SwitchField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string.isRequired,
	help: PropTypes.node,
	form: PropTypes.shape({
		getValues: PropTypes.func,
		register: PropTypes.func,
		watch: PropTypes.func,
	}),
	/**
	 * @see https://react-hook-form.com/api#register
	 */
	validation: PropTypes.shape({}),
};

SwitchField.defaultProps = {
	form: {},
	label: '',
	help: null,
	validation: {},
};

export default SwitchField;
