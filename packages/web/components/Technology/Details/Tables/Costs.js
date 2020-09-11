import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { formatMoney } from '../../../../utils/helper';

const Costs = ({ title, data, totalColor }) => {
	const emptyMessage = 'Nenhum custo cadastrado.';
	let isEmpty = false;

	if (!data?.length || !Array.isArray(data)) {
		isEmpty = true;
	}

	const typesValues = [
		{
			value: 'service',
			label: 'Serviço',
		},
		{
			value: 'raw_input',
			label: 'Insumo',
		},
		{
			value: 'equipment',
			label: 'Equipamento',
		},
		{
			value: 'others',
			label: 'Outro',
		},
	];

	const getTypeLabelByValue = (value) => {
		const typeLabel = typesValues.find((type) => type.value === value);

		return typeLabel?.label || value;
	};

	const items = data?.map((item) => ({
		id: item?.id,
		description: item?.description,
		type: getTypeLabelByValue(item?.type),
		quantity: item?.quantity,
		value: item?.value,
		total: item?.quantity * item?.value,
	}));

	const total = items?.reduce((acc, item) => acc + item.total, 0);

	return (
		<Container>
			<Title>{title}</Title>
			<section>
				{!isEmpty ? (
					<>
						<TableWrapper>
							<thead>
								<tr>
									<th>Descricao</th>
									<th>Tipo</th>
									<th>Qtde</th>
									<th>Valor</th>
									<th>Total</th>
								</tr>
							</thead>
							<tbody>
								{items.length &&
									items?.map((item) => (
										<tr key={item.id}>
											<td>{item.description}</td>
											<td>{item.type}</td>
											<td>{item.quantity}</td>
											<td>{formatMoney(item.value)}</td>
											<td>{formatMoney(item.total)}</td>
										</tr>
									))}
							</tbody>
						</TableWrapper>
						<Total color={totalColor}>{formatMoney(total)}</Total>
					</>
				) : (
					<EmptyMessage>{emptyMessage}</EmptyMessage>
				)}
			</section>
		</Container>
	);
};

const Container = styled.div`
	${({ theme: { screens, colors } }) => css`
		width: 100%;
		height: 100%;
		min-height: 20rem;
		background: ${colors.white};
		border: 0.1rem solid ${colors.mediumGray};
		border-radius: 0.2rem;
		margin-top: 3rem;

		@media (max-width: ${screens.small}px) {
			max-width: 40rem;
		}

		section {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0.8rem;
			width: 100%;
			height: 100%;
			overflow: auto;
		}
	`}
`;

const Title = styled.div`
	${({ theme: { colors } }) => css`
		font-size: 1.6rem;
		font-style: normal;
		font-weight: bold;
		background: ${colors.gray98};
		width: 100%;
		padding: 1.2rem;
		text-transform: uppercase;
		color: ${colors.black};
		border-bottom: 0.1rem solid ${colors.lightGray3};
	`}
`;

const TableWrapper = styled.table`
	${({ theme: { colors } }) => css`
		border-collapse: collapse;
		width: 100%;
		color: ${colors.black};
		overflow: scroll;

		th,
		td {
			padding: 0.8rem 0.5rem;
			border-bottom: 0.1rem solid ${colors.lightGray3};

			&:not(:first-child) {
				text-align: center;
			}
		}

		tr {
			&:first-of-type {
				border-bottom: 0.2rem solid ${colors.lightGray3};
			}

			&:nth-child(even) {
				background-color: ${colors.gray98};
			}

			th {
				font-weight: 500;
			}
		}
	`}
`;

const switchTotalColor = (color, colors) => {
	switch (color) {
		case 'green':
			return colors.darkGreen;
		case 'blue':
		default:
			return colors.blue;
	}
};

const Total = styled.p`
	${({ color, theme: { colors } }) => css`
		display: flex;
		width: 100%;
		flex: 1;
		justify-content: flex-end;
		font-style: normal;
		font-weight: bold;
		font-size: 1.6rem;
		line-height: 2rem;
		padding: 2rem;
		color: ${switchTotalColor(color, colors)};
	`}
`;

const EmptyMessage = styled.p`
	${({ theme: { colors } }) => css`
		color: ${colors.black};
		text-align: center;
	`}
`;

Costs.propTypes = {
	title: PropTypes.string.isRequired,
	data: PropTypes.arrayOf(PropTypes.shape({})),
	totalColor: PropTypes.string,
};

Costs.defaultProps = {
	totalColor: null,
	data: [],
};

export default Costs;
