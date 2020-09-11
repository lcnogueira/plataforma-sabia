import React from 'react';
import styled, { css } from 'styled-components';
import { Button } from '../../Button';
import { useTechnology } from '../../../hooks';
import Likes from '../../Card/Likes';
import { Protected } from '../../Authorization';

const defaultThumbnail = 'https://rocketfinalchallenge.s3.amazonaws.com/card-image.jpg';

const Header = () => {
	const { technology, implementationCosts } = useTechnology();

	return (
		<>
			<MainTitle>{technology.title}</MainTitle>

			<HeaderContainer>
				<ImageContainer
					src={technology.thumbnail || defaultThumbnail}
					alt={technology.title}
					data-testid="image"
				/>
				<DescriptionContainer>
					<UpContent>
						<DescriptionTitle>{technology.title}</DescriptionTitle>
						<Likes id={technology.id} count={technology.likes} />
					</UpContent>
					<DescriptionText>{technology.description}</DescriptionText>
					<ActionsContainer>
						{!!implementationCosts && (
							<ImplementationCost>
								<p>Custo de Implantação:</p>
								<Protected onlyUnauthorizedMessage messageSize={1.6}>
									<h5>{implementationCosts}</h5>
								</Protected>
							</ImplementationCost>
						)}
						<ButtonsContainer>
							<Button variant="success">Quero Adquirir Essa Tecnologia</Button>
							<Button variant="info">Quero Suporte Para Essa Tecnologia</Button>
						</ButtonsContainer>
					</ActionsContainer>
				</DescriptionContainer>
			</HeaderContainer>
		</>
	);
};

export const MainTitle = styled.h1`
	${({ theme: { colors } }) => css`
		color: ${colors.secondary};
		border-bottom: 1px solid ${colors.lightGray4};
		text-align: start;
		font-size: 2.8rem;
		font-weight: 600;
	`}
`;

export const UpContent = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const DescriptionTitle = styled.h2`
	${({ theme: { colors, screens } }) => css`
		color: ${colors.secondary};
		text-align: start;
		font-size: 2.8rem;
		font-weight: 600;

		@media (max-width: ${screens.medium}px) {
			margin-top: 1rem;
		}
	`}
`;

export const ImageContainer = styled.img`
	${({ theme: { screens, metrics, colors } }) => css`
		margin: 1rem 1rem 1rem 0;
		width: 100%;
		max-width: 450px;
		height: auto;
		border-radius: ${metrics.smallRadius}rem;
		box-shadow: 0.5px 0.5px 10px 0 ${colors.lightGray3};

		@media (max-width: ${screens.medium}px) {
			max-width: 100%;
		}
	`}
`;

export const HeaderContainer = styled.div`
	display: flex;
	justify-content: space-between;

	@media (max-width: ${({ theme }) => theme.screens.medium}px) {
		flex-direction: column;
	}
`;

export const DescriptionContainer = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: 1;

		@media (min-width: ${screens.medium}px) {
			padding: 1rem;
		}

		@media (min-width: ${screens.large}px) {
			padding: 2rem;
		}
	`}
`;

export const DescriptionText = styled.p`
	font-weight: 300;
	color: ${({ theme: { colors } }) => colors.black};
	padding: 1rem 0;
`;

export const ActionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export const ImplementationCost = styled.div`
	${({ theme: { colors, screens } }) => css`
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 2rem 0;

		@media (max-width: ${screens.medium}px) {
			flex-direction: column;
			justify-content: space-between;
		}

		p {
			font-size: 1.8rem;
			font-weight: 300;
			text-transform: uppercase;
			color: ${colors.black};

			@media (max-width: ${screens.medium}px) {
				margin-right: 0.5rem;
			}
		}

		h5 {
			font-weight: 700;
			font-size: 2rem;
			text-align: center;

			color: ${colors.primary};
		}
	`}
`;

export const ButtonsContainer = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		justify-content: space-evenly;

		@media (max-width: ${screens.medium}px) {
			flex-direction: column;
		}

		button {
			text-transform: uppercase;
			font-size: 1.8rem;
			padding: 0.8rem;
			border-radius: 2px;

			&:first-child {
				margin-right: 5px;
			}

			&:last-child {
				margin-right: 5px;
			}

			@media (max-width: ${screens.medium}px) {
				margin: 5px 0;
			}
		}
	`}
`;

export default Header;
