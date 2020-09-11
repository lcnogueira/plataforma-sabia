/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import { useTranslation } from 'react-i18next';
import InputField from './InputField';

const currencySettings = {
	pt: {
		prefix: 'R$ ',
		thousandSeparator: '.',
		decimalSeparator: ',',
		pattern: /(?=.*\d)^(R\$\s)?(([1-9]\d{0,2}(\.\d{3})*)|0)?(,\d{1,2})?$/,
	},
	en: {
		prefix: '$ ',
		thousandSeparator: ',',
		decimalSeparator: '.',
		pattern: /(?=.*\d)^(\$\s)?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,2})?$/,
	},
};

/**
 * This component works as a wrapper: you can provide all of the props InputField component expects.
 * However, you SHOULD provide name to the component itself.
 *
 * @returns {React.Component} An InputField instance.
 */
const CurrencyInputField = ({ name, defaultValue, ...inputFieldProps }) => {
	const { t, i18n } = useTranslation(['error']);
	const [value, setValue] = useState(defaultValue || '');

	return (
		<NumberFormat
			prefix={currencySettings[i18n.language].prefix}
			thousandSeparator={currencySettings[i18n.language].thousandSeparator}
			decimalSeparator={currencySettings[i18n.language].decimalSeparator}
			onChange={(e) => setValue(e.target.value)}
			value={value}
			name={name}
			customInput={InputField}
			{...inputFieldProps}
			validation={{
				...inputFieldProps.validation,
				pattern: {
					value: currencySettings[i18n.language].pattern,
					message: t('invalidPattern'),
				},
			}}
		/>
	);
};

CurrencyInputField.propTypes = {
	name: PropTypes.string.isRequired,
	defaultValue: PropTypes.string,
};

CurrencyInputField.defaultProps = {
	defaultValue: '',
};

export default CurrencyInputField;
