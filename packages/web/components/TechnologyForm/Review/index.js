import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFilePdf } from 'react-icons/fa';
import Section from '../../Technology/Details/Section';
import TextValue from '../../Technology/Details/TextValue';
import {
	Costs as CostsTable,
	Responsibles as ResponsiblesTable,
} from '../../Technology/Details/Tables';
import {
	Cell,
	Row,
	Wrapper,
	Checkbox,
	UploadedImages,
	UploadedDocuments,
	UploadsTitle,
	IconRow,
	IconLink,
	Media,
} from './styles';

const Review = ({ data: { technology } }) => {
	const [acceptedTerms, setAcceptedTerms] = useState({
		usage: false,
		privacy: false,
	});

	const responsibles = [
		technology.technologyResponsibles?.owner,
		...technology.technologyResponsibles?.users,
	];

	const fundingData = {
		types: [
			{
				value: 'public',
				label: 'Público',
			},
			{
				value: 'private',
				label: 'Privado',
			},
			{
				value: 'collective',
				label: 'Coletivo',
			},
		],
		status: [
			{
				value: 'not_acquired',
				label: 'Não adquirido',
			},
			{
				value: 'acquiring',
				label: 'Em aquisição',
			},
			{
				value: 'acquired',
				label: 'Já adquirido',
			},
		],
	};

	const getFundingLabelByValue = (scope, value) => {
		const keys = Object.keys(fundingData);

		if (!scope || !keys.some((key) => key === scope)) {
			return value;
		}

		const funding = fundingData[scope].find((data) => data.value === value);

		return funding?.label || value;
	};

	// eslint-disable-next-line consistent-return
	const handleAcceptedTerms = (type) => {
		const types = Object.keys(acceptedTerms);

		if (!type || !types.some((item) => item === type)) {
			return null;
		}

		setAcceptedTerms({
			...acceptedTerms,
			[type]: !acceptedTerms[type],
		});
	};

	return (
		<Wrapper>
			<Row>
				<Cell col="2">
					<Section title="Identificação" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue title="Título" value={technology?.title} />
						<TextValue
							title="Nome Popular"
							value={technology?.taxonomies?.popular_name}
						/>
						<TextValue title="Sigla" value={technology?.taxonomies?.initials} />
						<TextValue title="Descrição" value={technology?.description} />
						<TextValue title="Categoria" value={technology?.taxonomies?.category} />
						<TextValue
							title="Classificação"
							value={technology?.taxonomies?.classification}
						/>
						<TextValue title="Dimensão" value={technology?.taxonomies?.dimension} />
						<TextValue
							title="Público-alvo"
							value={technology?.taxonomies?.target_audience}
						/>
						<TextValue title="Bioma" value={technology?.taxonomies?.biome} />
						<TextValue
							title="Programa Governamental"
							value={technology?.taxonomies?.government_program}
						/>
						<TextValue
							title="Palavras-chave"
							value={technology?.taxonomies?.keywords}
						/>
					</Section>

					<Section title="Aspectos Legais" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue
							title="Tecnologia Patenteada"
							value={technology?.patent}
							boolean
						/>
						<TextValue
							title="Proteção Intelectual"
							value={technology?.taxonomies?.intellectual_property}
						/>
					</Section>

					<Section
						title="Estágio de Desenvolvimento"
						color="lightGray"
						hideWhenIsEmpty={false}
					>
						<TextValue title="Escala TRL" value={technology?.taxonomies?.stage} />
					</Section>

					<Section title="Financiamento" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue
							title="Necessita de Financiamento"
							value={technology?.technologyCosts?.funding_required}
							boolean
						/>
						<TextValue
							title="Tipo de Financiamento"
							value={getFundingLabelByValue(
								'types',
								technology?.technologyCosts?.funding_type,
							)}
						/>
						<TextValue
							title="Valor do Financiamento"
							value={technology?.technologyCosts?.funding_value}
						/>
						<TextValue
							title="Situação"
							value={getFundingLabelByValue(
								'status',
								technology?.technologyCosts?.funding_status,
							)}
						/>
					</Section>

					<Section title="Custos da Tecnologia" color="lightGray" hideWhenIsEmpty={false}>
						<CostsTable
							title="Custo de Desenvolvimento"
							data={technology?.technologyCosts?.costs?.development_costs}
							totalColor="green"
						/>
						<CostsTable
							title="Custos de Implantação"
							data={technology?.technologyCosts?.costs?.implementation_costs}
						/>
						<CostsTable
							title="Custos de Manutenção"
							data={technology?.technologyCosts?.costs?.maintenence_costs}
							totalColor="green"
						/>
					</Section>

					<Section title="Documentos" color="lightGray" hideWhenIsEmpty={false}>
						<UploadsTitle>Fotos da Tecnologia</UploadsTitle>
						{technology.attachments.images.length ? (
							<UploadedImages>
								{technology.attachments.images?.map((element) => (
									<IconRow key={element.url}>
										<Media src={element.url} />
									</IconRow>
								))}
							</UploadedImages>
						) : (
							<p>Nenhuma foto cadastrada</p>
						)}
						<UploadsTitle>Documentos</UploadsTitle>
						{technology.attachments.documents.length ? (
							<UploadedDocuments>
								{technology.attachments.documents?.map((element) => (
									<IconRow row key={element.url}>
										<IconLink href={element.url}>
											<FaFilePdf size="2rem" /> {element.filename}
										</IconLink>
									</IconRow>
								))}
							</UploadedDocuments>
						) : (
							<p>Nenhum documento cadastrado</p>
						)}
					</Section>
				</Cell>

				<Cell col="2">
					<Section title="Objetivos" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue title="Objetivo Principal" value={technology?.primary_purpose} />
						<TextValue
							title="Objetivos secundários"
							value={technology?.secondary_purpose}
						/>
					</Section>

					<Section title="Problematização" color="lightGray" hideWhenIsEmpty>
						<TextValue
							title="Problemas que a tecnologia soluciona"
							value={technology?.solves_problem}
						/>
						<TextValue
							title="Problemas que a tecnologia acarreta"
							value={technology?.entailes_problem}
						/>
					</Section>

					<Section title="Aplicação" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue
							title="Onde é a Aplicação"
							value={technology?.taxonomies?.locale}
						/>
						<TextValue
							title="Forma de Aplicação"
							value={technology?.application_mode}
						/>
						<TextValue
							title="Exemplos de Aplicação"
							value={technology?.application_examples}
						/>
						<TextValue
							title="Pré-requisitos para a implantação"
							value={technology?.taxonomies?.prerequisites_for_deployment}
						/>
						<TextValue
							title="Duração do processo de instalação da tecnologia"
							value={technology?.taxonomies?.installation_time}
						/>
					</Section>

					<Section title="Contribuição" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue
							title="Contribuição para o semiárido"
							value={technology?.contribution}
						/>
					</Section>

					<Section title="Riscos" color="lightGray" hideWhenIsEmpty={false}>
						<TextValue
							title="Riscos associados à tecnologia"
							value={technology?.risks}
						/>
					</Section>

					<Section title="Responsáveis" color="lightGray" hideWhenIsEmpty={false}>
						<ResponsiblesTable data={responsibles} />
					</Section>
				</Cell>
			</Row>

			<Row>
				<Cell>
					<Section title="Termos de Aceitação" color="lightGray" hideWhenIsEmpty={false}>
						<Checkbox
							name="acceptUsageTerms"
							value={acceptedTerms.usage}
							onChange={() => handleAcceptedTerms('usage')}
							label="Declaro que aceito os termos de uso"
							required
						/>
						<Checkbox
							name="acceptPrivacyTerms"
							value={acceptedTerms.privacy}
							onChange={() => handleAcceptedTerms('privacy')}
							label="Declaro que aceito a política de privacidade"
							required
						/>
					</Section>
				</Cell>
			</Row>
		</Wrapper>
	);
};

Review.propTypes = {
	form: PropTypes.shape({
		getValues: PropTypes.func,
	}),
	data: PropTypes.shape({
		technology: PropTypes.shape({
			attachments: PropTypes.shape({
				images: PropTypes.arrayOf(PropTypes.shape({})),
				documents: PropTypes.arrayOf(PropTypes.shape({})),
			}),
			technologyResponsibles: PropTypes.shape({
				owner: PropTypes.shape({}),
				users: PropTypes.arrayOf(PropTypes.shape({})),
			}),
		}),
	}),
};

Review.defaultProps = {
	form: {},
	data: {
		technology: {
			attachments: {
				images: [],
				documents: [],
			},
			technologyResponsibles: {
				owner: {},
				users: [{}],
			},
		},
	},
};

export default Review;
