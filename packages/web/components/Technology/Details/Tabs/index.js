import React from 'react';
import { resetIdCounter } from 'react-tabs';
import styled, { css } from 'styled-components';
import * as Layout from '../../../Common/Layout';
import { Tab, TabList, TabPanel, Tabs as Container } from '../../../Tab';
import About from './About';
import Description from './Description';
import Review from './Review';
import Costs from './Costs';
import Attachments from './Attachments';

const Tabs = () => {
	const tabs = [
		{ slug: 'about', label: 'Sobre a Tecnologia', component: About },
		{ slug: 'description', label: 'Caracterização', component: Description },
		{ slug: 'costs', label: 'Custos e Financiamento', component: Costs },
		{ slug: 'review', label: 'Relatos de Experiência', component: Review },
		{ slug: 'attachments', label: 'Documentos', component: Attachments },
	];

	return (
		<Container>
			<TabList>
				{tabs.map((tab) => (
					<Tab key={tab.slug} data-testid={tab.slug}>
						{tab.label}
					</Tab>
				))}
			</TabList>

			{tabs.map((tab) => (
				<TabPanel key={tab.slug}>
					<Row>{React.createElement(tab.component)}</Row>
				</TabPanel>
			))}
		</Container>
	);
};

Tabs.getInitialProps = () => {
	resetIdCounter();
};

export const Row = styled(Layout.Row)`
	${({ theme: { colors, screens } }) => css`
		background-color: ${colors.white};

		& > *:not(:first-child):not(:last-child) {
			margin: 0 1rem;
		}

		@media (max-width: ${screens.large}px) {
			& > *:not(:first-child):not(:last-child) {
				margin-top: 1.5rem;
			}
		}
	`}
`;

export default Tabs;
