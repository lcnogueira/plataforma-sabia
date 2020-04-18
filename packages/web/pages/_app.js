/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import 'react-dom';
import App from 'next/app';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../styles/global';
import Layout from '../components/layout';
import { theme } from '../styles';

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;

		return (
			<ThemeProvider theme={theme}>
				<GlobalStyle />
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</ThemeProvider>
		);
	}
}
