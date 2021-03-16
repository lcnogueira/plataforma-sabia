import React from 'react';
import PropTypes from 'prop-types';
import { ContentContainer, SectionTitle } from '../Common';
import { CardsWrapper } from './styles';

const SolutionsWrapper = ({ children, header, bgColor, overrideAlgoliaStyle }) => {
	return (
		<ContentContainer bgColor={bgColor} padding="3.2rem 5%">
			{!!header && <SectionTitle noPadding>{header}</SectionTitle>}
			<CardsWrapper $overrideAlgoliaStyle={overrideAlgoliaStyle} data-testid="cards-wrapper">
				{children}
			</CardsWrapper>
		</ContentContainer>
	);
};

SolutionsWrapper.propTypes = {
	children: PropTypes.node.isRequired,
	header: PropTypes.string,
	bgColor: PropTypes.string,
	overrideAlgoliaStyle: PropTypes.bool,
};

SolutionsWrapper.defaultProps = {
	header: null,
	bgColor: '',
	overrideAlgoliaStyle: false,
};

export default SolutionsWrapper;
