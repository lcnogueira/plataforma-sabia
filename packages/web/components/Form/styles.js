import styled, { css } from 'styled-components';

export const InputLabel = styled.label`
	color: ${({ theme }) => theme.colors.lightGray};
	font-size: 1.4rem;
	font-weight: 500;
`;

export const InputError = styled.span`
	color: ${({ theme }) => theme.colors.red};
	margin: 0 0 1rem 0;
	display: inline-block;
`;

export const Row = styled.div`
	${({ flexDirection, alignItems }) => css`
		display: flex;
		flex-direction: ${flexDirection};
		align-items: ${alignItems || 'flex-end'};
	`}
`;

export const inputModifiers = {
	default: ({ colors }) => css`
		background: ${colors.white};
		border: 1px solid ${colors.mediumGray};
		border-radius: 0.2rem;
		color: ${colors.lightGray};
	`,
	gray: ({ colors, metrics }) => css`
		border: 1px solid ${colors.lightGray4};
		border-radius: ${metrics.baseRadius}rem;
		background: ${colors.lightGray4};
	`,
	rounded: ({ colors, metrics }) => css`
		background: ${colors.white};
		border: 1px solid ${colors.mediumGray};
		border-radius: ${metrics.baseRadius}rem;
		color: ${colors.lightGray};
	`,
};

export const StyledInput = styled.input`
	${({ theme: { colors, metrics }, disabled, variant }) => css`
		width: 100%;
		height: 4.4rem;
		font-size: 1.4rem;
		margin: 0.5rem 0;
		padding: 1.2rem;
		opacity: ${disabled ? 0.5 : 1};

		&::placeholder {
			color: ${colors.lightGray2};
			font-weight: 300;
			font-style: italic;
		}

		${!!variant && inputModifiers[variant]({ colors, metrics })}
	`}
`;

const inputWrapperModifiers = {
	labelTop: css`
		display: flex;
		flex-direction: column;
	`,
	labelRight: css`
		display: flex;
		align-items: center;

		${StyledInput} {
			width: auto;
		}
		${InputLabel} {
			order: 2;
			margin-left: 1rem;
		}
	`,
	labelLeft: css`
		display: flex;
		align-items: center;

		${InputLabel} {
			margin-right: 1rem;
		}
	`,
};

export const InputFieldWrapper = styled.div`
	${({ theme: { colors }, hasError, labelPlacement, customCss, isHidden }) => css`
		font-size: 1.4rem;
		line-height: 14px;

		> div.wrapper {
			display: flex;
		}

		${hasError &&
			css`
				> input {
					border: 1px solid ${colors.primary};
				}
				> .react-select-container .react-select__control {
					border-color: ${colors.primary};
				}
			`}

		${labelPlacement === 'top' && inputWrapperModifiers.labelTop}
		${labelPlacement === 'right' && inputWrapperModifiers.labelRight}
		${labelPlacement === 'left' && inputWrapperModifiers.labelLeft}
		${isHidden &&
			css`
				display: none;
			`}


		${customCss}
	`}
`;
