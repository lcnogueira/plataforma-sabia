import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AiTwotoneFlag } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { toast } from '../../../components/Toast';
import { ContentContainer, Title } from '../../../components/Common';
import { useTheme, useAuth } from '../../../hooks';
import { Protected } from '../../../components/Authorization';
import {
	AboutTechnology,
	Details,
	Review,
	Responsible,
	Costs,
	MapAndAttachments,
} from '../../../components/TechnologyForm';
import FormWizard from '../../../components/Form/FormWizard';
import {
	getTaxonomies,
	createTechnology,
	getTechnology,
	updateTechnology,
	getTechnologyCosts,
	updateTechnologyCosts,
	updateTechnologyResponsibles,
	updateUser,
	getAttachments,
	attachNewTerms,
	getTechnologyTerms,
} from '../../../services';

const techonologyFormSteps = [
	{ slug: 'about', label: 'Sobre a Tecnologia', form: AboutTechnology },
	{ slug: 'features', label: 'Caracterização', form: Details },
	{ slug: 'costs', label: 'Custos e Financiamento', form: Costs },
	{ slug: 'responsible', label: 'Responsáveis', form: Responsible },
	{ slug: 'map-and-attachments', label: 'Mapas e Anexos', form: MapAndAttachments },
	{ slug: 'review', label: 'Revisão', form: Review, icon: AiTwotoneFlag },
];

/**
 * Gets the owner and the regular users of the technology
 *
 * @param {object} currentUser The current logged in user
 * @param {object} technologyUsers All the technology users
 *
 * @returns {object}
 */
const getOwnerAndUsers = (currentUser, technologyUsers) => {
	const owner = technologyUsers.find(({ id }) => id === currentUser.id);
	const users = technologyUsers.filter(({ id }) => id !== currentUser.id);
	return { owner, users };
};

const updateTechnologyRequest = ({ technologyId, data, nextStep }) => {
	if (nextStep !== 'review') {
		return updateTechnology(technologyId, data, { normalize: true });
	}
	return attachNewTerms(technologyId, data, { normalize: true });
};

const TechnologyFormPage = ({ taxonomies, technology, initialStep }) => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(initialStep || techonologyFormSteps[0].slug);
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Handles submitting the technology form.
	 *
	 * @param {object} params The form params object.
	 * @param {object} params.data The form data object.
	 * @param {string} params.step The current step of the form.
	 * @param {string} params.nextStep The next step of the form.
	 * @param {object} form The react hook form object.
	 *
	 */
	const handleSubmit = async ({ data, step, nextStep }, form) => {
		setSubmitting(true);

		const { reset, getValues } = form;
		let result = false;

		const technologyId = technology?.id;
		if (step === techonologyFormSteps[0].slug && typeof technologyId === 'undefined') {
			const technologyData = await createTechnology(data);
			if (technologyData?.id) {
				router.push(
					'/technology/[id]/edit?step=features',
					`/technology/${technologyData.id}/edit?step=features`,
				);
				setCurrentStep(nextStep);
				setSubmitting(false);
				return;
			}
		} else {
			result = await updateTechnologyRequest({
				technologyId,
				data,
				nextStep,
			});

			if (data.technologyCosts?.costs) {
				result.technologyCosts = await updateTechnologyCosts(
					technologyId,
					data.technologyCosts,
					{ normalize: true },
				);
			} else {
				result.technologyCosts = getValues('technologyCosts');
			}

			if (data.technologyResponsibles) {
				const {
					owner: { user_id, current_lattes_id, new_lattes_id },
					users,
				} = data.technologyResponsibles;

				// If the logged in user updated the own lattes_id
				if (current_lattes_id !== new_lattes_id) {
					await updateUser(user_id, { lattes_id: new_lattes_id });
				}

				if (users) {
					const technologyUsers = await updateTechnologyResponsibles(technologyId, {
						users,
					});

					result.technologyResponsibles = getOwnerAndUsers(user, technologyUsers);
				}
			} else {
				result.technologyResponsibles = getValues('technologyResponsibles');
			}
		}

		if (result) {
			if (nextStep) {
				reset(result);
				setCurrentStep(nextStep);
				window.scrollTo({ top: 0 });
			} else {
				toast.info('Você será redirecionado para as suas tecnologias', {
					closeOnClick: false,
					onClose: async () => {
						await router.push('/user/my-account/technologies');
						window.scrollTo({ top: 0 });
					},
				});
			}
		}

		setSubmitting(false);
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
					submitting={submitting}
					steps={techonologyFormSteps}
					data={{
						taxonomies,
						technology,
					}}
					defaultValues={technology}
				/>
			</Protected>
		</ContentContainer>
	);
};

TechnologyFormPage.propTypes = {
	taxonomies: PropTypes.shape({}).isRequired,
	technology: PropTypes.shape({}).isRequired,
	initialStep: PropTypes.string,
};

TechnologyFormPage.defaultProps = {
	initialStep: '',
};

TechnologyFormPage.getInitialProps = async ({ query, res, user }) => {
	const taxonomies = await getTaxonomies({ embed: true, parent: false, normalize: true });

	let technology = {};

	if (query && query.id) {
		technology = await getTechnology(query.id, {
			normalize: true,
			normalizeTaxonomies: true,
			embed: true,
		});

		const { users: technologyUsers } = technology;

		if (technologyUsers) {
			technology.technologyResponsibles = getOwnerAndUsers(user, technologyUsers);
		}

		// redirect if that technology does not exist or does not belong to this user.
		if (!technology && res) {
			return res
				.writeHead(302, {
					Location: '/technology/new',
				})
				.end();
		}

		technology.technologyCosts = await getTechnologyCosts(query.id, {
			normalize: true,
		});
		technology.attachments = await getAttachments(query.id, { normalize: true });
		technology.rawTerms = await getTechnologyTerms(query.id);
	}

	return {
		initialStep: query?.step || '',
		taxonomies,
		technology,
		namespacesRequired: ['common', 'error'],
	};
};

export default TechnologyFormPage;
