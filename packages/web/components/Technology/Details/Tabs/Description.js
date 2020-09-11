import React from 'react';
import { useTechnology } from '../../../../hooks';
import * as Layout from '../../../Common/Layout';
import Section from '../Section';
import TextValue from '../TextValue';

const Description = () => {
	const { technology } = useTechnology();

	return (
		<>
			<Layout.Cell col="2">
				<Section title="Objetivos">
					<TextValue title="Objetivo Principal" value={technology.primary_purpose} />
					<TextValue title="Objetivos secundários" value={technology.secondary_purpose} />
				</Section>

				<Section title="Aplicação">
					<TextValue title="Onde é a Aplicação" value={technology.application_mode} />
					<TextValue title="Aplicação" value={technology.application_mode} />
					<TextValue
						title="Exemplos de Aplicação"
						value={technology.application_examples}
					/>
					<TextValue
						title="Pré-requisitos para a implantação"
						value={technology.requirements}
					/>
					<TextValue
						title="Duração do processo de instalação da tecnologia"
						value={`${technology.installation_time} dias`}
					/>
				</Section>
			</Layout.Cell>

			<Layout.Cell col="2">
				<Section title="Problematização">
					<TextValue
						title="Problemas que a tecnologia soluciona"
						value={technology.solves_problem}
					/>
					<TextValue
						title="Problemas que a tecnologia acarreta"
						value={technology.entailes_problem}
					/>
				</Section>

				<Section title="Contribuição">
					<TextValue
						title="Contribuição para o semiárido"
						value={technology.contribution}
					/>
				</Section>

				<Section title="Riscos">
					<TextValue title="Riscos associados à tecnologia" value={technology.risks} />
				</Section>
			</Layout.Cell>
		</>
	);
};

export default Description;
