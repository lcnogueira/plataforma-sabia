/* eslint-disable no-nested-ternary */
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
	${({ theme: { metrics, screens }, bgColor, color, uppercase, disabled }) => css`
		background-color: ${bgColor};
		color: ${color};
		border-radius: ${metrics.baseRadius}rem;
		border: none;
		font-size: 2.2rem;
		text-transform: ${uppercase ? 'uppercase' : 'none'};
		padding: 1.8rem 6rem;
		text-align: center;
		text-decoration: none;
		display: inline-block;

		:hover {
			opacity: 0.8;
		}

		${disabled &&
			css`
				opacity: 0.8;
				cursor: not-allowed;
			`}

		@media (max-width: ${screens.medium}px) {
			font-size: 1.6rem;
			padding: 1.4rem 6rem;
		}
	`}
`;

export const CircularButton = styled.button`
	align-items: center;
	justify-content: center;
	background-color: ${({ bgColor }) => bgColor};
	color: ${({ color }) => color};
	border-radius: 100%;
	height: ${({ height }) => (height ? `${height}rem` : '100%')};
	${({ width }) => (width ? `width: ${width}rem` : '')};
	border: none;
	font-size: ${({ size }) =>
		size === 'small' ? '1.2rem' : size === 'medium' ? '1.6rem' : '2rem'};
	text-transform: uppercase;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	padding: ${({ size }) => (size === 'small' ? '0.2rem !important' : '1rem !important')};

	float: ${({ float }) => float || 'right'};

	:hover {
		opacity: 0.8;
	}

	display: flex;
	position: relative;
`;

const iconButtonModifiers = {
	gray: (colors) => css`
		border: 2px solid ${colors.lightGray2};
		color: ${colors.lightGray2};

		:hover:not(:disabled) {
			color: ${colors.white};
			background-color: ${colors.lightGray2};
		}
	`,
	info: (colors) => css`
		border: 2px solid ${colors.blue};
		color: ${colors.blue};

		:hover:not(:disabled) {
			color: ${colors.white};
			background-color: ${colors.blue};
		}
	`,
	remove: (colors) => css`
		border: 2px solid ${colors.red};
		color: ${colors.red};

		:hover:not(:disabled) {
			color: ${colors.white};
			background-color: ${colors.red};
		}
	`,
	success: (colors) => css`
		border: 2px solid ${colors.secondary};
		color: ${colors.secondary};

		:hover:not(:disabled) {
			color: ${colors.white};
			background-color: ${colors.secondary};
		}
	`,
};

export const IconButton = styled.button`
	${({ theme: { colors }, variant }) => css`
		border: none;
		background: none;
		outline: none;

		display: flex;
		padding: 0.8rem;

		:focus {
			box-shadow: 0px 0px 4px 2px ${colors.primary};
		}

		:disabled {
			cursor: not-allowed;
			opacity: 0.4;
		}

		${!!variant && iconButtonModifiers[variant](colors)}
	`}
`;

const rectangularColorsToTheme = {
	grey: 'lightGray2',
	red: 'red',
	orange: 'primary',
	green: 'darkGreen',
};

const rectangularButtonVariants = {
	text: (colors, colorVariant) => css`
		:hover:not(:disabled) {
			border-color: ${colors[rectangularColorsToTheme[colorVariant]]};
			color: ${colors[rectangularColorsToTheme[colorVariant]]};
			background-color: transparent;
		}
	`,
	outlined: (colors, colorVariant) => css`
		border-color: ${colors[rectangularColorsToTheme[colorVariant]]};
	`,
	filled: (colors, colorVariant) => css`
		color: ${colors.white};
		background-color: ${colors[rectangularColorsToTheme[colorVariant]]};

		:hover:not(:disabled) {
			opacity: 0.74;
		}
	`,
};

export const RectangularButton = styled.button`
	${({ theme: { colors, screens }, variant, colorVariant }) => css`
		border: 2px solid transparent;
		background: none;
		font-size: 1.4rem;
		font-weight: bold;
		width: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 0.4rem 0.8rem;
		line-height: 2.4rem;
		text-transform: uppercase;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		@media screen and (min-width: ${screens.medium}px) {
			width: auto;
		}

		color: ${colors[rectangularColorsToTheme[colorVariant]]};

		:hover:not(:disabled) {
			color: ${colors.white};
			background-color: ${colors[rectangularColorsToTheme[colorVariant]]};
			border-color: ${colors[rectangularColorsToTheme[colorVariant]]};
		}

		:focus {
			box-shadow: 0px 0px 4px 2px ${colors.primary};
		}

		${!!variant && rectangularButtonVariants[variant](colors, colorVariant)};
	`}
`;

export default StyledButton;
