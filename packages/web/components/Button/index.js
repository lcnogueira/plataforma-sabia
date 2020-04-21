import React from 'react';
import PropTypes from 'prop-types';

import { useTheme } from 'styled-components';
import StyledButton from './styles';

const Button = ({ children, onClick, variant, type }) => {
	const { colors } = useTheme();

	const bgColor = variant === 'primary' ? colors.primary : colors.black;

	return (
		<StyledButton onClick={onClick} type={type} bgColor={bgColor} color={colors.white}>
			{children}
		</StyledButton>
	);
};

Button.propTypes = {
	children: PropTypes.string.isRequired,
	variant: PropTypes.oneOf(['primary', 'secondary']),
	onClick: PropTypes.func,
	type: PropTypes.string,
};

Button.defaultProps = {
	type: 'button',
	variant: 'primary',
	onClick: () => {},
};

export default Button;
