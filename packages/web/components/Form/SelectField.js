/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import styled, { css } from 'styled-components';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputFieldWrapper, InputLabel, InputError, Row } from './styles';
import { validationErrorMessage } from '../../utils/helper';
import Help from './Help';

const styles = css`
	width: 100%;
	margin: 0.5rem 0;
	font-size: 1.4rem;

	.react-select__control {
		min-height: 4.4rem;
		border-radius: 0.2rem;
	}

	.react-select__value-container > div {
		color: ${({ theme: { colors } }) => colors.lightGray};
	}
`;

const StyledSelect = styled(Select)`
	${styles}
`;
const StyledCreatable = styled(CreatableSelect)`
	${styles}
`;

const SelectField = ({
	name,
	form,
	label,
	help,
	options,
	validation,
	creatable,
	onCreate,
	isMulti,
	callback,
	...selectProps
}) => {
	const { t } = useTranslation(['error']);
	const [needsUpdate, setNeedsUpdate] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [selectOptions, setSelectOptions] = useState(options);

	const { errors, control, watch, setValue, getValues } = form;
	let selectedValue = watch(name);
	if (selectedValue) {
		selectedValue = Array.isArray(selectedValue)
			? selectedValue.map((value) => `${value}`)
			: `${selectedValue}`;
		selectedValue = Array.isArray(selectedValue) && !isMulti ? selectedValue[0] : selectedValue;
	}

	// update the select options whenever options prop changes
	useEffect(() => {
		setSelectOptions(options);
	}, [options]);

	/**
	 * React-select expects value to be in { value: '', label: '' } shape so we run a useEffect
	 * to ensure it's in the right format. This allows this component to be intialized just with the value.
	 */
	useEffect(() => {
		if (!needsUpdate) {
			return;
		}

		if (!options || options.length === 0) {
			return;
		}

		if (!selectedValue) {
			setNeedsUpdate(false);
			return;
		}

		if (isMulti) {
			setValue(
				name,
				selectedValue.map((value) => options.find((option) => option.value === value)),
			);
		} else {
			setValue(
				name,
				options.find((option) => option.value === selectedValue),
			);
		}

		setNeedsUpdate(false);
	}, [selectedValue, options, name, setValue, isMulti, needsUpdate]);

	/**
	 * Handles creating a new element in the select field.
	 *
	 * Only called if `creatable` is true.
	 *
	 * @param {string} inputValue The inserted input value.
	 *
	 */
	const onCreateOption = async (inputValue) => {
		setIsLoading(true);
		const newOption = await onCreate(inputValue);
		setIsLoading(false);
		setSelectOptions([...options, newOption]);

		const currentValue = getValues(name) || [];

		if (isMulti) {
			setValue(name, [...currentValue, newOption]);
		} else {
			setValue(name, newOption);
		}

		return newOption;
	};
	const Component = creatable ? StyledCreatable : StyledSelect;

	return (
		<InputFieldWrapper hasError={typeof errors[name] !== 'undefined'}>
			{label && <InputLabel htmlFor={name}>{label}</InputLabel>}
			<Row>
				<Controller
					as={Component}
					className="react-select-container"
					classNamePrefix="react-select"
					control={control}
					rules={validation}
					onChange={([selectedOption]) => {
						if (typeof callback === 'function') callback(selectedOption);
						return selectedOption;
					}}
					id={name}
					name={name}
					aria-label={label}
					aria-required={validation.required}
					options={selectOptions}
					isMulti={isMulti}
					onCreateOption={creatable ? onCreateOption : null}
					isDisabled={isLoading}
					isLoading={isLoading}
					{...selectProps}
				/>
				{help && <Help id={name} HelpComponent={help} />}
			</Row>

			{errors && Object.keys(errors).length ? (
				<InputError>{validationErrorMessage(errors, name, t)}</InputError>
			) : null}
		</InputFieldWrapper>
	);
};

SelectField.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	creatable: PropTypes.bool,
	onCreate: PropTypes.func,
	isMulti: PropTypes.bool,
	form: PropTypes.shape({
		errors: PropTypes.shape({}),
		control: PropTypes.shape({}),
		watch: PropTypes.func,
		setValue: PropTypes.func,
		getValues: PropTypes.func,
	}),
	help: PropTypes.node,
	/**
	 * @see https://react-hook-form.com/api#register
	 */
	validation: PropTypes.shape({
		required: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	}),
	options: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string,
			value: PropTypes.string,
		}),
	),
	callback: PropTypes.func,
};

SelectField.defaultProps = {
	label: '',
	form: {},
	creatable: false,
	onCreate: () => {},
	isMulti: false,
	validation: {},
	options: [],
	help: null,
	callback: null,
};

export default SelectField;
