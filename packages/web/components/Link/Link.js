import React from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { StyledLink } from './styles';

export const Link = ({ children, href, as, passHref, replace, scroll, hover }) => {
	return (
		<NextLink href={href} as={as} passHref={passHref} replace={replace} scroll={scroll}>
			<StyledLink hover={hover}>{children}</StyledLink>
		</NextLink>
	);
};

Link.propTypes = {
	children: PropTypes.node.isRequired,
	href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
	as: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	passHref: PropTypes.bool,
	replace: PropTypes.bool,
	scroll: PropTypes.bool,
	hover: PropTypes.bool,
};

Link.defaultProps = {
	as: null,
	passHref: true,
	replace: true,
	scroll: true,
	hover: false,
};

export default Link;
