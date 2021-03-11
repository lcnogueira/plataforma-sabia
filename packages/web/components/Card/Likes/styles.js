import styled, { css, keyframes } from 'styled-components';

const animations = {
	heart: {
		zoom: keyframes`
			0%, 100% {
				transform: scale(1);
			}
			50% {
				transform: scale(1.1);
			}
		`,
		like: keyframes`
			0%, 25%, 60%, 100% {
				transform: scale(1);
			}
			10% {
				transform: scale(1.4);
			}
			40% {
				transform: scale(1.2);
			}
			75% {
				transform: scale(1.1);
			},
		`,
		dislike: keyframes`
			0%, 30% {
				transform: scale(1);
			}
			15% {
				transform: scale(.9);
			}
		`,
	},
	count: {
		like: keyframes`
			0%, 100% {
				visibility: visible;
				opacity: 1;
				transform: translateY(0%);
			}
			50% {
				visibility: hidden;
				opacity: 0;
				transform: translateY(100%);
			}
		`,
		dislike: keyframes`
			0%, 100% {
				visibility: visible;
				opacity: 1;
				transform: translateY(0%);
			}
			50% {
				visibility: hidden;
				opacity: 0;
				transform: translateY(100%);
			}
		`,
	},
};

function switchLikeAnimation(type, animation) {
	const allowedTypes = ['heart', 'count'];

	if (!allowedTypes.some((allowedType) => allowedType === type)) {
		return 'none';
	}

	const scope = animations[type];

	switch (animation) {
		case 'like':
			return scope?.like;
		case 'dislike':
			return scope?.dislike;
		default:
			return 'none';
	}
}

const containerColorVariants = {
	default: (colors, filled) => css`
		svg {
			color: ${filled ? colors.red : colors.lightGray2};
		}
		span {
			color: ${colors.lightGray};
		}
	`,
	white: (colors, filled) => css`
		svg {
			color: ${filled ? colors.red : colors.white};
		}
		span {
			color: ${colors.white};
		}
	`,
};

// eslint-disable-next-line import/prefer-default-export
export const Container = styled.div`
	${({ theme: { colors, sizes }, duration, animation, colorVariant, filled }) => css`
		display: flex;
		align-items: center;
		padding: 0.5rem;
		gap: 0.6rem;
		cursor: pointer;

		span {
			display: inline-block;
			font-size: 1.6rem;
			animation: ${duration}s ${switchLikeAnimation('count', animation)};
		}

		svg {
			width: ${sizes.defaultIcon}rem;
			height: ${sizes.defaultIcon}rem;
			animation: ${duration}s ${switchLikeAnimation('heart', animation)};

			&:hover {
				animation: ${duration}s ${animations.heart.zoom};
			}
		}

		${!!colorVariant && containerColorVariants[colorVariant](colors, filled)};
	`}
`;
