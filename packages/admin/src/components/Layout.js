import React from 'react';
import { Layout as LayoutRA } from 'react-admin';
import AppBar from './AppBar';
import Menu from './Menu';

// eslint-disable-next-line react/jsx-props-no-spreading
const Layout = (props) => <LayoutRA {...props} appBar={AppBar} menu={Menu} />;

export default Layout;
