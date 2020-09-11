import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { AiOutlineCheckCircle, AiOutlineExclamationCircle } from 'react-icons/ai';
import { useTheme } from '../../../../hooks';

const Responsibles = ({ data }) => {
	const { colors, sizes } = useTheme();

	const items = data?.map((item) => ({
		id: item?.id,
		name: item?.full_name,
		email: item?.email,
		phone_number: item?.phone_number,
		lattes_id: item?.lattes_id,
		verified: item?.status === 'verified',
	}));

	return (
		<Container>
			<section>
				<TableWrapper>
					<thead>
						<tr>
							<th>Nome</th>
							<th>E-mail</th>
							<th>Telefone</th>
							<th>ID Lattes</th>
							<th>Cadastrado</th>
						</tr>
					</thead>
					<tbody>
						{items.length &&
							items?.map((item) => (
								<tr key={item.id}>
									<td>{item.name}</td>
									<td>{item.email}</td>
									<td>{item.phone_number}</td>
									<td>{item.lattes_id}</td>
									<td>
										{item.verified ? (
											<AiOutlineCheckCircle
												color={colors.darkGreen}
												size={`${sizes.defaultIcon}rem`}
											/>
										) : (
											<AiOutlineExclamationCircle
												color={colors.darkOrange}
												size={`${sizes.defaultIcon}rem`}
											/>
										)}
									</td>
								</tr>
							))}
					</tbody>
				</TableWrapper>
			</section>
		</Container>
	);
};

const Container = styled.div`
	${({ theme: { screens, colors } }) => css`
		width: 100%;
		height: 100%;
		background: ${colors.white};
		margin-top: 3rem;
		background: transparent;

		@media (max-width: ${screens.large}px) {
			max-width: 80rem;
		}

		@media (max-width: ${screens.medium}px) {
			max-width: 65rem;
			margin: auto;
		}

		section {
			padding: 0.8rem;
			width: 100%;
			height: 100%;
			background: transparent;
			overflow-x: auto;
			overflow-y: hidden;
		}
	`}
`;

const TableWrapper = styled.table`
	${({ theme: { colors } }) => css`
		border-collapse: collapse;
		width: 100%;
		color: ${colors.black};

		th,
		td {
			padding: 0.8rem 0.5rem;
			border-bottom: 0.1rem solid ${colors.lightGray3};

			&:not(:first-child) {
				text-align: center;
			}
		}

		thead th {
			font-weight: 500;
			border-bottom: 0.2rem solid ${colors.lightGray3};
		}

		tbody tr {
			&:nth-child(odd) {
				background-color: ${colors.lightGray4};
			}
		}
	`}
`;

Responsibles.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({})),
};

Responsibles.defaultProps = {
	data: [],
};

export default Responsibles;
