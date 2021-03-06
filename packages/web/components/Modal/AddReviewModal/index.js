import React, { useCallback, useState, createElement } from 'react';
import PropTypes from 'prop-types';
import HasNoTechnology from './HasNoTechnology';
import AddReview from './AddReview';
import { Container, Question, ButtonsContainer, Button } from './styles';

const components = {
	addReview: AddReview,
	hasNoTechnology: HasNoTechnology,
};

const AddReviewModal = ({ technology, mutate }) => {
	const [currentContent, setCurrentContent] = useState(null);

	const switchContent = useCallback(() => {
		return components[currentContent]
			? createElement(components[currentContent], { technology, mutate })
			: null;
	}, [currentContent, mutate, technology]);

	return (
		switchContent() || (
			<Container>
				<Question>Você já tem essa tecnologia?</Question>
				<ButtonsContainer>
					<Button type="negative" onClick={() => setCurrentContent('hasNoTechnology')}>
						Ainda não
					</Button>
					<Button type="positive" onClick={() => setCurrentContent('addReview')}>
						Sim, já tenho
					</Button>
				</ButtonsContainer>
			</Container>
		)
	);
};

AddReviewModal.propTypes = {
	technology: PropTypes.shape({}),
	mutate: PropTypes.func.isRequired,
};

AddReviewModal.defaultProps = {
	technology: {},
};

export default AddReviewModal;
