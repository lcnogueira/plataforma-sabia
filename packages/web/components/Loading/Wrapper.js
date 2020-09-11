import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

const Wrapper = ({ loading, variant, children }) => {
	return loading ? <Spinner variant={variant} /> : children;
};

Wrapper.propTypes = {
	loading: PropTypes.bool,
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf(['primary', 'secondary', 'white']),
};

Wrapper.defaultProps = {
	loading: true,
	variant: 'primary',
};

export default Wrapper;
