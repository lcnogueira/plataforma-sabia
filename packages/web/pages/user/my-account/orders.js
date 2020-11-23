import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { FiMessageSquare, FiEye, FiX, FiCheck } from 'react-icons/fi';
import { UserProfile } from '../../../components/UserProfile';
import { Protected } from '../../../components/Authorization';
import { Title } from '../../../components/Common';
import { DataGrid } from '../../../components/DataGrid';
import { IconButton } from '../../../components/Button';
import { ORDERING as orderEnum } from '../../../utils/enums/api.enum';
import { dateToString } from '../../../utils/helper';
import { STATUS as dealStatusEnum } from '../../../utils/enums/orders.enum';
import { useModal } from '../../../hooks';
import OrderMessages from '../../../components/OrderMessages';

const sortOptions = [
	{ value: 'title', label: 'Título' },
	{ value: 'responsible', label: 'Responsável' },
	{ value: 'status', label: 'Status' },
	{ value: 'order_date', label: 'Data do pedido' },
];
const itemsPerPage = 5;

const ordersMock = [
	{
		id: 1,
		title: 'Tecnologia Um',
		quantity: 1,
		buyer: 'Fulano',
		status: 'deal_struck',
		created_at: '2020-11-09 12:53:24.000000',
	},
	{
		id: 2,
		title: 'Tecnologia Dois',
		quantity: 123,
		buyer: 'Beltrano',
		status: 'deal_ongoing',
		created_at: '2020-11-19 12:53:24.000000',
	},
	{
		id: 3,
		title: 'Tecnologia Tres',
		quantity: 413,
		buyer: 'Ciclano',
		status: 'deal_cancelled',
		created_at: '2020-03-14 12:53:24.000000',
	},
];

/**
 * Returns deal status text based on status key
 *
 * @param {string} value The status key
 * @returns {string} Status text
 */
export const getDealStatusText = (value) =>
	({
		[dealStatusEnum.DEAL_STRUCK]: 'Fechado',
		[dealStatusEnum.DEAL_ONGOING]: 'Em negociação',
		[dealStatusEnum.DEAL_CANCELLED]: 'Cancelado',
	}[value]);

const Orders = ({ orders, currentPage, totalPages, totalItems, currentSort }) => {
	const { t } = useTranslation(['helper', 'account']);
	const router = useRouter();
	const { openModal } = useModal();
	const [currentOrderMessages, setCurrentOrderMessages] = useState(null);
	/**
	 * Pushes new page number to next/router
	 *
	 * @param {string} page Page number.
	 */
	const handlePagination = (page) => {
		const { pathname, query } = router;
		query.page = page;

		router.push({
			pathname,
			query,
		});
	};

	/**
	 * Pushes new sort options to next/router
	 *
	 * @param {string} orderBy Grid column to sort items.
	 * @param {('ASC'|'DESC')} order Sort order.
	 * @returns {Promise<boolean>} Next router push
	 */
	const handleSortBy = (orderBy, order = currentSort.order || orderEnum.ASC) => {
		const { pathname, query } = router;

		delete query.page;

		const shouldOrderAsc = order === orderEnum.DESC && currentSort.by !== orderBy;
		query.order = shouldOrderAsc ? orderEnum.ASC : order;
		query.orderBy = orderBy;

		return router.push({
			pathname,
			query,
		});
	};

	return (
		<Container>
			<Protected>
				<UserProfile />
				{currentOrderMessages ? (
					<OrderMessages
						isBuyer={false}
						currentOrder={currentOrderMessages}
						backToList={() => setCurrentOrderMessages(null)}
					/>
				) : (
					<MainContentContainer>
						<Title align="left" noPadding noMargin>
							{t('account:titles.orders')}
						</Title>
						<MainContent>
							{orders.length ? (
								<DataGrid
									data={orders.map((order) => {
										const { id, title, buyer, status, created_at } = order;

										return {
											id,
											Título: title,
											Comprador: buyer,
											Status: (
												<DealStatus status={status}>
													{getDealStatusText(status)}
												</DealStatus>
											),
											'Data do pedido': dateToString(created_at),
											Ações: (
												<DealActions>
													<IconButton
														variant="gray"
														aria-label="Order details"
														onClick={() => openModal('orderDetails')}
													>
														<FiEye />
													</IconButton>
													<IconButton
														variant="success"
														aria-label="Settle the deal"
														onClick={() => openModal('settleDeal')}
														disabled={
															status === dealStatusEnum.DEAL_STRUCK
														}
													>
														<FiCheck />
													</IconButton>
													<IconButton
														variant="info"
														aria-label="Send message to technology owner"
														onClick={() =>
															setCurrentOrderMessages(order)
														}
													>
														<FiMessageSquare />
													</IconButton>
													<IconButton
														variant="remove"
														aria-label="Cancel order"
														disabled={
															status === dealStatusEnum.DEAL_CANCELLED
														}
														onClick={() => openModal('cancelOrder')}
													>
														<FiX />
													</IconButton>
												</DealActions>
											),
										};
									})}
									hideItemsByKey={['id']}
									currentPage={currentPage}
									totalPages={totalPages}
									totalItems={totalItems}
									itemsPerPage={itemsPerPage}
									currentOrder={currentSort.order}
									sortOptions={sortOptions}
									handlePagination={handlePagination}
									handleSortBy={handleSortBy}
									enablePagination
								/>
							) : (
								<NoOrders>{t('account:messages.noOrdersToShow')}</NoOrders>
							)}
						</MainContent>
					</MainContentContainer>
				)}
			</Protected>
		</Container>
	);
};

Orders.propTypes = {
	orders: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
	currentPage: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	totalItems: PropTypes.number.isRequired,
	currentSort: PropTypes.shape({
		by: PropTypes.string,
		order: PropTypes.string,
	}),
};

Orders.defaultProps = {
	currentSort: {},
};

Orders.getInitialProps = async (ctx) => {
	const { query } = ctx;

	const page = Number(query.page) || 1;

	return {
		orders: ordersMock,
		currentPage: page,
		totalPages: 1,
		totalItems: 3,
		currentSort: { by: query.orderBy, order: query.order },
		sortOptions,
		namespacesRequired: ['helper', 'account', 'profile', 'datagrid'],
	};
};

export const Container = styled.div`
	display: flex;
	margin: 0 auto;
	background-color: ${({ theme }) => theme.colors.whiteSmoke};
	padding: 3rem 4rem 6rem;

	> section:first-child {
		margin-right: 4rem;
	}

	@media screen and (max-width: 950px) {
		flex-direction: column;

		> section:first-child {
			margin-bottom: 1rem;
		}
	}
`;

export const MainContentContainer = styled.section`
	width: 100%;
`;

export const MainContent = styled.div`
	min-height: 80vh;
	background-color: ${({ theme }) => theme.colors.white};
	padding: 2rem;
`;

export const InfoContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;

	@media screen and (max-width: 950px) {
		flex-direction: column;

		button {
			margin-bottom: 1rem;
		}
	}
`;

export const NoOrders = styled.span`
	color: ${({ theme }) => theme.colors.darkGray};
	font-size: 2rem;
`;

const statusModifiers = {
	[dealStatusEnum.DEAL_STRUCK]: (colors) => css`
		color: ${colors.secondary};
		&::before {
			background: ${colors.secondary};
		}
	`,
	[dealStatusEnum.DEAL_ONGOING]: (colors) => css`
		color: ${colors.lightGray2};
		&::before {
			background: ${colors.lightGray2};
		}
	`,
	[dealStatusEnum.DEAL_CANCELLED]: (colors) => css`
		color: ${colors.red};
		&::before {
			background: ${colors.red};
		}
	`,
};

export const DealStatus = styled.div`
	${({ theme: { colors }, status }) => css`
		display: inline-block;
		position: relative;
		line-height: 2.4rem;
		font-weight: 500;
		padding: 0.2rem 0.8rem;
		max-width: fit-content;
		text-align: center;

		&::before {
			content: '';
			display: block;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 1.45rem;
			opacity: 0.1;
		}

		${!!status && statusModifiers[status](colors)};
	`}
`;

export const DealActions = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;

		> button {
			margin: 0 1.2rem 0 0;
		}

		svg {
			font-size: 1.4rem;
			stroke-width: 3;
		}

		@media screen and (min-width: ${screens.large}px) {
			justify-content: center;

			> button {
				margin: 0.8rem;
			}
		}
	`}
`;

export default Orders;
