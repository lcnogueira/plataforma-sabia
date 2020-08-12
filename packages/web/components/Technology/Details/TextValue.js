import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const TextValue = ({ title, value, boolean = false }) => {
	const { t } = useTranslation(['common']);

	if (!value && typeof value !== 'number') {
		return null;
	}

	if (boolean) {
		// eslint-disable-next-line no-param-reassign
		value = value ? t('common:yes') : t('common:no');
	}

	return (
		<Container>
			{!!title && <strong>{title}: </strong>}
			<span>{value}</span>
		</Container>
	);
};

TextValue.propTypes = {
	title: PropTypes.string,
	boolean: PropTypes.bool.isRequired,
	value: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.number]),
};

TextValue.defaultProps = {
	title: null,
	value: null,
};

export const Container = styled.p`
	${({ theme: { colors } }) => css`
		font-size: 1.6rem;
		line-height: 2.4rem;

		strong {
			color: ${colors.darkGray};
		}

		span {
			color: ${colors.black};
		}
	`}
`;

export default TextValue;
