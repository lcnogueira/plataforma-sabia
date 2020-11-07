import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AiTwotoneFlag } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { toast } from '../../../components/Toast';
import { ContentContainer, Title } from '../../../components/Common';
import { useTheme } from '../../../hooks';
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
	registerTechnology,
} from '../../../services';
import { formatMoney } from '../../../utils/helper';

const techonologyFormSteps = [
	{
		slug: 'about',
		label: 'Sobre a Tecnologia',
		form: AboutTechnology,
		description:
			'O cadastro de tecnologias compreende 6 passos. Na primeira etapa você irá informar os metadados de categorização da tecnologia. A cada tela que você avança, automaticamente os dados serão salvos. Você poderá voltar a qualquer momento e continuar o cadastro da etapa onde parou. Poderá também clicar no botão voltar para ir para as etapas anteriores.',
	},
	{
		slug: 'features',
		label: 'Caracterização',
		form: Details,
		description:
			'Nessa etapa você irá informar dados textuais da plataforma. Procure dar clareza e objetividade no conteúdo para deixar a leitura mais agradável possível por parte dos usuários.',
	},
	{
		slug: 'costs',
		label: 'Custos e Financiamento',
		form: Costs,
		description:
			'Essa etapa é opcional, mas muito importante para informar os custos relativos a tecnologia, desde o desenvolvimento (para as tecnologias que ainda estão sendo criadas) ao custo de implantação e manutenção. O financiamento é para os inventores que desejam recursos para desenvolver suas tecnologias e necessitam de financiamento. Parceiros poderão entrar em contato para oferecer as melhores opções de financiamento.',
	},
	{
		slug: 'responsible',
		label: 'Responsáveis',
		form: Responsible,
		description:
			'Informe todos responsáveis pela criação da tecnologia. São as pessoas que irão responder pelo cadastro. A primeira pessoa do cadastro é a que irá ser o contato principal na plataforma para esse cadastro.',
	},
	{
		slug: 'map-and-attachments',
		label: 'Mapas e Anexos',
		form: MapAndAttachments,
		description:
			'Etapa muito importante para conhecermos os locais que a tecnologia é desenvolvida, pode ser utilizada e onde ela já foi implantada. Essa busca é realizada no Google Maps, portanto, poderá procurar por empresas, instituições ou cidades. Em anexos você poderá informar fotos, links para vídeos no YouTube e documentos em PDF (cartilha, manual etc). Esses arquivos anexos não poderão ultrapassar 4MB de tamanho.',
	},
	{
		slug: 'review',
		label: 'Revisão',
		form: Review,
		icon: AiTwotoneFlag,
		description:
			'Confira todos os dados cadastrados. Se necessitar alterar, basta voltar e alterar os dados. Se estiver tudo certo marque os termos da política de privacidade e clique no botão CONCLUIR.',
	},
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

const updateTechnologyRequest = async ({ technologyId, data, nextStep }) => {
	if (nextStep === 'review') {
		await attachNewTerms(technologyId, data, { normalize: true });
	}
	return updateTechnology(technologyId, data, { normalize: true });
};

const TechnologyFormPage = ({ taxonomies, technology }) => {
	const { colors } = useTheme();
	const router = useRouter();
	const {
		query: { step: currentStep },
	} = router;
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Handles submitting the technology form.
	 *
	 * @param {object} params The form params object.
	 * @param {object} params.data The form data object.
	 * @param {string} params.step The current step of the form.
	 * @param {string} params.nextStep The next step of the form.
	 */
	const handleSubmit = async ({ data, step, nextStep }) => {
		setSubmitting(true);

		let result = false;

		const technologyId = technology?.id;
		if (step === techonologyFormSteps[0].slug && typeof technologyId === 'undefined') {
			const technologyData = await createTechnology(data);
			if (technologyData?.id) {
				router.push(
					'/technology/[id]/edit/[step]',
					`/technology/${technologyData.id}/edit/${nextStep}`,
				);
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
				await updateTechnologyCosts(technologyId, data.technologyCosts, {
					normalize: true,
				});
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
					await updateTechnologyResponsibles(technologyId, {
						users,
					});
				}
			}
		}

		if (result) {
			if (nextStep) {
				await router.push(
					'/technology/[id]/edit/[step]',
					`/technology/${technologyId}/edit/${nextStep}`,
				);
				window.scrollTo({ top: 0 });
			} else {
				await registerTechnology(technologyId, data);
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

	const handlePrev = ({ prevStep }) => {
		router.push(
			'/technology/[id]/edit/[step]',
			`/technology/${technology?.id}/edit/${prevStep}`,
		);
	};

	return (
		<ContentContainer bgColor={colors.gray98}>
			<Protected>
				<Title align="left" noPadding noMargin>
					Cadastrar <span>Tecnologia</span>
				</Title>

				<FormWizard
					// forces a re-render to populate defaultValues, otherwise we would need to call reset()
					key={currentStep}
					onSubmit={handleSubmit}
					onPrev={handlePrev}
					currentStep={currentStep || techonologyFormSteps[0].slug}
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

		if (technologyUsers && ['responsible', 'review'].includes(query?.step)) {
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

		if (['costs', 'review'].includes(query?.step)) {
			const technologyCosts = await getTechnologyCosts(query.id, {
				normalize: true,
			});

			const {
				costs: { implementation_costs = [], maintenance_costs = [] } = {},
				funding_value = 0,
			} = technologyCosts;

			if (implementation_costs.length)
				technologyCosts.costs.implementation_costs = implementation_costs.map((cost) => ({
					...cost,
					value: formatMoney(cost.value),
				}));

			if (maintenance_costs.length)
				technologyCosts.costs.maintenance_costs = maintenance_costs.map((cost) => ({
					...cost,
					value: formatMoney(cost.value),
				}));

			if (funding_value) technologyCosts.funding_value = formatMoney(funding_value);

			technology.technologyCosts = technologyCosts;
		}

		if (['map-and-attachments', 'review'].includes(query.step)) {
			technology.attachments = await getAttachments(query.id, { normalize: true });
			technology.rawTerms = await getTechnologyTerms(query.id);
			technology.terms.where_can_be_applied = 'semiarido';
		}
	}

	return {
		taxonomies,
		technology,
		namespacesRequired: ['common', 'error'],
	};
};

export default TechnologyFormPage;
