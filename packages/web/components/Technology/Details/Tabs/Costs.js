import React from 'react';
import { useTechnology } from '../../../../hooks';
import * as Layout from '../../../Common/Layout';
import Section from '../Section';
import { Costs as CostsTable } from '../Tables';
import { Protected } from '../../../Authorization';

const Costs = () => {
	const { technology } = useTechnology();

	return (
		<Layout.Cell col="2">
			<Section title="Custos da Tecnologia" hideWhenIsEmpty={false}>
				<Protected inline>
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
				</Protected>
			</Section>
		</Layout.Cell>
	);
};

export default Costs;
