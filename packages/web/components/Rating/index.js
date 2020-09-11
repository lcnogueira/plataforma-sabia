import React from 'react';
import PropTypes from 'prop-types';
import ReactRating from 'react-rating';

import { FillStar, OutlineStar } from './styles';

/**
 * A smart star rating component.
 *
 * @see https://github.com/dreyescat/react-rating
 *
 * @returns {React.Element}
 */
const Rating = ({
	start,
	stop,
	step,
	fractions,
	value,
	readonly,
	onChange,
	onHover,
	onClick,
	size,
}) => (
	<ReactRating
		start={start}
		stop={stop}
		step={step}
		fractions={fractions}
		initialRating={value}
		readonly={readonly}
		onChange={onChange}
		onHover={onHover}
		onClick={onClick}
		emptySymbol={<OutlineStar size={size} />}
		fullSymbol={<FillStar size={size} />}
	/>
);

Rating.propTypes = {
	start: PropTypes.number,
	stop: PropTypes.number,
	step: PropTypes.number,
	fractions: PropTypes.number,
	value: PropTypes.number,
	size: PropTypes.number,
	readonly: PropTypes.bool,
	onChange: PropTypes.func,
	onHover: PropTypes.func,
	onClick: PropTypes.func,
};

Rating.defaultProps = {
	start: 0,
	stop: 5,
	step: 1,
	fractions: 1,
	value: 0,
	size: null,
	readonly: false,
	onChange: null,
	onHover: null,
	onClick: null,
};

export default Rating;
