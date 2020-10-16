import React from 'react';
import { useTechnology } from '../../../../hooks';
import * as Layout from '../../../Common/Layout';
import Section from '../Section';
import TextValue from '../TextValue';
import TechnologyReadinessLevel from '../ReadinessLevel';
import { normalizeTrl } from '../../../../utils/technology';

const About = () => {
	const { technology } = useTechnology();

	const { slug: readinessLevelSlug } = normalizeTrl(technology.terms);
	const currentStage = Number(readinessLevelSlug.split('-', 2)[1]);

	return (
		<>
			<Layout.Cell col="1">
				<Section title="Identificação">
					<TextValue title="Título" value={technology.title} />
					<TextValue title="Nome Popular" value={technology.taxonomies?.popular_name} />
					<TextValue title="Sigla" value={technology.taxonomies?.initials} />
					<TextValue title="Descrição" value={technology.description} />
					<TextValue title="Categoria" value={technology.taxonomies?.category} />
					<TextValue
						title="Classificação"
						value={technology.taxonomies?.classification}
					/>
					<TextValue title="Dimensão" value={technology.taxonomies?.dimension} />
					<TextValue
						title="Público-alvo"
						value={technology.taxonomies?.target_audience}
					/>
					<TextValue title="Bioma" value={technology.taxonomies?.biome} />
					<TextValue
						title="Programa Governamental"
						value={technology.taxonomies?.government_program}
					/>
				</Section>

				<Section title="Aspectos Legais">
					<TextValue title="Tecnologia Patenteada" value={technology.patent} boolean />
					<TextValue
						title="Direitos intelectuais"
						value={technology.taxonomies?.intellectual_property}
					/>
				</Section>

				<Section title="Desenvolvedor">
					<TextValue value={technology.taxonomies?.developer} />
				</Section>
			</Layout.Cell>
			{currentStage >= 7 && (
				<Layout.Cell col="1">
					<Section title="Estágio de desenvolvimento" hideWhenIsEmpty={false}>
						<TechnologyReadinessLevel />
					</Section>
				</Layout.Cell>
			)}
		</>
	);
};

export default About;
