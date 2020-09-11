import React from 'react';
import PropTypes from 'prop-types';

import { Container, Loader } from './styles';

const Spinner = ({ variant }) => (
	<Container>
		<Loader variant={variant} />
	</Container>
);

Spinner.propTypes = {
	variant: PropTypes.oneOf(['primary', 'secondary', 'white']),
};

Spinner.defaultProps = {
	variant: 'primary',
};

export default Spinner;
