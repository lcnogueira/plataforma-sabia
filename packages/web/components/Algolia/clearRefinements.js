import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { AiOutlineReload } from 'react-icons/ai';

import { ClearRefinements as AlgoliaClearRefinements } from 'react-instantsearch-dom';

const ClearRefinements = ({ placeholder }) => (
	<StyledClearRefinements
		translations={{
			reset: (
				<>
					<AiOutlineReload />
					{placeholder}
				</>
			),
		}}
	/>
);

ClearRefinements.propTypes = {
	placeholder: PropTypes.string,
};

ClearRefinements.defaultProps = {
	placeholder: 'Limpar',
};

const StyledClearRefinements = styled(AlgoliaClearRefinements)`
	font-size: 1.2rem;

	button {
		display: flex;
		justify-content: center;
		font-weight: 400;
		background: none;
		border: 0;
	}

	svg {
		margin-right: 0.8rem;
	}
`;

export default ClearRefinements;
