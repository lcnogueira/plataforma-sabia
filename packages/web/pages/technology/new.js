import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AiTwotoneFlag } from 'react-icons/ai';
import { ContentContainer, Title } from '../../components/Common';
import { useTheme } from '../../hooks';
import { Protected } from '../../components/Authorization';
import { AboutTechnology } from '../../components/TechnologyForm';
import Details from '../../components/TechnologyForm/Details';
import FormWizard from '../../components/Form/FormWizard';
import { getTaxonomies } from '../../services';

const newTechonologySteps = [
	{ slug: 'about', label: 'Sobre a Tecnologia', form: AboutTechnology },
	{ slug: 'features', label: 'Caracterização', form: Details },
	{ slug: 'review', label: 'Revisão', form: null, icon: AiTwotoneFlag },
];

const NewTechnology = ({ taxonomies }) => {
	const { colors } = useTheme();
	const [currentStep, setCurrentStep] = useState(newTechonologySteps[0].slug);

	const handleSubmit = (data) => {
		setCurrentStep(data.nextStep);
	};

	const initialValues = {
		taxonomies,
	};

	return (
		<ContentContainer bgColor={colors.gray98}>
			<Protected>
				<Title align="left" noPadding noMargin>
					Cadastrar <span>Tecnologia</span>
				</Title>

				<FormWizard
					onSubmit={handleSubmit}
					onPrev={({ prevStep }) => setCurrentStep(prevStep)}
					currentStep={currentStep}
					steps={newTechonologySteps}
					initialValues={initialValues}
				/>
			</Protected>
		</ContentContainer>
	);
};

NewTechnology.propTypes = {
	taxonomies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

NewTechnology.getInitialProps = async () => {
	const taxonomies = await getTaxonomies({ embed: true, normalize: true });

	return {
		taxonomies,
		namespacesRequired: ['common', 'error'],
	};
};

export default NewTechnology;
