import React from 'react';
import PropTypes from 'prop-types';

const currencySymbol = {
	BRL: 'R$',
	USD: '$',
};

const currencyCode = {
	BRL: 'pt-BR',
	USD: 'en-US',
};

const Price = ({ amount, currency }) => {
	return amount ? (
		<span>
			{`${currencySymbol[currency]} ${String(
				new Intl.NumberFormat(currencyCode[currency], {
					currency,
					minimumFractionDigits: 2,
				}).format(amount),
			).replace(String.fromCharCode(160), String.fromCharCode(32))}`}
		</span>
	) : null;
};

Price.propTypes = {
	amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	currency: PropTypes.string,
};

Price.defaultProps = {
	currency: 'BRL',
};

export default Price;
