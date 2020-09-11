import React from 'react';
import PropTypes from 'prop-types';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import styled from 'styled-components';
import { Row } from '../../Common';

const List = ({ itens }) => {
	return itens.map((text) => (
		<Container key={text}>
			<Row>
				<FaRegArrowAltCircleRight />
				<span>{text}</span>
			</Row>
		</Container>
	));
};

List.propTypes = {
	itens: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export const Container = styled.div`
	padding-left: 2rem;
	margin: 1rem 0 0 0;
	span {
		margin: 0 0 0 1rem;
	}
	svg {
		height: ${({ theme }) => theme.sizes.largeIcon}rem;
		width: ${({ theme }) => theme.sizes.largeIcon}rem;
	}
`;
export default List;
