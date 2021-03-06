import styled, { css } from 'styled-components';
import { MdClose } from 'react-icons/md';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Close = styled(MdClose)`
	${({ theme }) => css`
		color: ${theme.colors.white};
		cursor: pointer;
		margin-left: auto;
		width: 2.4rem;
		height: 2.4rem;
	`}
`;

export const Content = styled.div`
	max-width: 100vw;
	max-height: 80rem;
	margin: 0 auto;
`;
