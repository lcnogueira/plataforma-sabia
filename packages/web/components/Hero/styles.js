import styled, { css } from 'styled-components';
import { TabList as RTablList } from 'react-tabs';

import { Tabs, Tab as RTab } from '../Tab';

export const HeroImage = styled.div`
	${({ image }) => css`
		background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${image});
		height: 60vh;

		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;

		display: flex;
		justify-content: center;
		align-items: center;
	`};
`;

export const TabsWrapper = styled(Tabs)`
	${({ theme: { colors, metrics } }) => css`
		box-shadow: -4px 4px 24px rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: ${metrics.baseRadius}rem;
		background-color: ${colors.white};

		max-width: 77rem;
		width: 100%;
		padding: 2.4rem;
		padding-top: 1.6rem;

		h1 {
			font-size: 5.6rem;
			margin-bottom: 1.6rem;
		}

		p {
			font-family: 'Rubik';
			color: ${({ theme }) => theme.colors.white};
			line-height: 1.2;
			font-size: 2.8rem;
			margin-bottom: 0.8rem;
		}

		@media (max-width: ${({ theme }) => theme.screens.medium}px) {
			margin: -2rem 2rem 3rem 2rem;

			h1 {
				line-height: 1.3;
				font-size: 3.5rem;
				margin-bottom: 1rem;
			}

			p {
				margin-bottom: 3rem;
				line-height: 1.3;
			}
		}
	`}
`;

export const TabsHeader = styled.div`
	margin-bottom: 1.6rem;
`;

export const TabList = styled(RTablList)`
	${({ theme: { screens } }) => css`
		padding: 0;
		display: grid;
		grid-column-gap: 3.2rem;

		@media screen and (min-width: ${screens.medium}px) {
			grid-template-columns: repeat(2, max-content);
			grid-template-rows: 1fr;
		}
	`}
`;

export const Tab = styled(RTab)`
	${({ selected, theme: { colors } }) => css`
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: uppercase;

		border: none;
		bottom: 0;
		position: relative;

		font-weight: 700;
		font-size: 1.2rem;

		background-color: transparent;
		color: ${selected ? colors.black : colors.lightGray2};

		padding: 0.8rem 0;

		:after {
			content: '';
			position: absolute;
			bottom: 0;
			right: 0;
			left: 0;
			border-bottom: 4px solid ${selected ? colors.secondary : 'transparent'};
		}
	`}
`;
