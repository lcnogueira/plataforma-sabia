import * as React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@material-ui/core';
import { MenuItemLink, getResources } from 'react-admin';
import DefaultIcon from '@material-ui/icons/ViewList';

const Menu = ({ onMenuClick, logout }) => {
	const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('xs'));
	const open = useSelector((state) => state.admin.ui.sidebarOpen);
	const resources = useSelector(getResources);
	return (
		<div>
			{resources.map((resource) => (
				<MenuItemLink
					key={resource.name}
					to={`/${resource.name}`}
					primaryText={(resource.options && resource.options.label) || resource.name}
					leftIcon={resource.icon ? <resource.icon /> : <DefaultIcon />}
					onClick={onMenuClick}
					sidebarIsOpen={open}
				/>
			))}
			{isXSmall && logout}
		</div>
	);
};
Menu.propTypes = {
	logout: PropTypes.shape({}).isRequired,
	onMenuClick: PropTypes.func,
};
Menu.defaultProps = {
	onMenuClick: () => {},
};
export default Menu;
