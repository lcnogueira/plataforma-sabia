import styled, { css } from 'styled-components';
import { AiFillPlusCircle, AiFillMinusCircle } from 'react-icons/ai';

export const SelectContainer = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		justify-content: flex-end;

		select {
			padding: 0.5rem;
			font-size: 1.4rem;

			@media (max-width: ${screens.medium}px) {
				width: 100%;
			}
		}
	`}
`;

export const Item = styled.li`
	${({ theme: { colors } }) => css`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		list-style: none;
		padding: 2rem 0;

		&:not(:last-child) {
			border-bottom: 0.1rem solid ${colors.mediumGray};
		}
	`}
`;

export const Header = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		width: 100%;

		@media (max-width: ${screens.small}px) {
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;
		}

		& > :first-child {
			width: calc(100% - 12rem);
		}

		& > :last-child {
			width: 12rem;

			@media (max-width: ${screens.small}px) {
				margin-top: 1rem;
			}
		}
	`}
`;

export const FullName = styled.p`
	${({ theme: { colors } }) => css`
		font-size: 1.8rem;
		font-weight: 500;
		padding-bottom: 0.5rem;
		color: ${colors.blue};
	`}
`;

export const Text = styled.p`
	${({ theme: { colors } }) => css`
		font-weight: 300;
		font-size: 1.6rem;
		line-height: 2rem;
		color: ${colors.black};
	`}
`;

export const PointsContainer = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;

		@media (max-width: ${screens.medium}px) {
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;

			ul {
				width: 100%;

				&:first-of-type {
					margin-bottom: 1rem;
				}
			}
		}
	`}
`;

export const PointsTitle = styled.p`
	${({ positive, theme: { colors } }) => css`
		font-weight: 500;
		color: ${positive ? colors.secondary : colors.red};
	`}
`;

export const PointsItem = styled.div`
	${({ theme: { sizes } }) => css`
		display: flex;
		align-items: flex-start;
		justify-content: initial;
		margin: 0.5rem;

		p {
			width: calc(100% - ${sizes.mediumIcon}rem);
		}

		svg {
			width: ${sizes.mediumIcon}rem;
			margin-right: 0.5rem;
		}
	`}
`;

export const PositiveIcon = styled(AiFillPlusCircle).attrs(({ theme: { colors, sizes } }) => ({
	color: colors.secondary,
	size: `${sizes.mediumIcon}rem`,
}))``;

export const NegativeIcon = styled(AiFillMinusCircle).attrs(({ theme: { colors, sizes } }) => ({
	color: colors.red,
	size: `${sizes.mediumIcon}rem`,
}))``;
