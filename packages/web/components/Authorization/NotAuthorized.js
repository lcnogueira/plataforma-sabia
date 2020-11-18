import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const NotAuthorized = ({ size, messageI18n }) => {
	const { t } = useTranslation(['error']);

	return (
		<Container size={size} data-testid="notAuthorized">
			<h1>{t(messageI18n)}</h1>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;

	h1 {
		color: ${({ theme }) => theme.colors.darkGray};
		font-size: ${({ size }) => size || 3.6}rem;
		margin: auto;
	}
`;

NotAuthorized.propTypes = {
	size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	messageI18n: PropTypes.string,
};

NotAuthorized.defaultProps = {
	size: null,
	messageI18n: 'error:notAuthorized',
};

export default NotAuthorized;
