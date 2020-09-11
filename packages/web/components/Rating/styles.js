import styled from 'styled-components';
import { AiFillStar } from 'react-icons/ai';

export const FillStar = styled(AiFillStar).attrs(({ size, theme: { colors, sizes } }) => ({
	color: colors.primary,
	size: `${size || sizes.mediumIcon}rem`,
}))``;

export const OutlineStar = styled(AiFillStar).attrs(({ size, theme: { colors, sizes } }) => ({
	color: colors.lightGray4,
	size: `${size || sizes.mediumIcon}rem`,
}))``;
