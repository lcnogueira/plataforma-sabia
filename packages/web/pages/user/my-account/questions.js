import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { FiEye } from 'react-icons/fi';
import { UserProfile } from '../../../components/UserProfile';
import { Protected } from '../../../components/Authorization';
import { Title } from '../../../components/Common';
import { DataGrid } from '../../../components/DataGrid';
import { IconButton } from '../../../components/Button';
import { ORDERING as orderEnum } from '../../../utils/enums/api.enum';
import { dateToString } from '../../../utils/helper';
import { STATUS as questionsStatusEnum } from '../../../utils/enums/questions.enum';
import { useModal } from '../../../hooks';

const sortOptions = [
	{ value: 'technology', label: 'Tecnologia' },
	{ value: 'user', label: 'Usuário' },
	{ value: 'status', label: 'Status' },
	{ value: 'question_date', label: 'Data da pergunta' },
];
const itemsPerPage = 5;

const questionsMock = [
	{
		id: 1,
		technology: 'Tecnologia Um',
		user: 'Fulano',
		status: 'question_answered',
		created_at: '2020-11-09 12:53:24.000000',
	},
	{
		id: 2,
		technology: 'Tecnologia Dois',
		user: 'Ciclano',
		status: 'quesion_not_answered',
		created_at: '2020-11-19 12:53:24.000000',
	},
	{
		id: 3,
		technology: 'Tecnologia Tres',
		user: 'Beltrano',
		status: 'question_refused',
		created_at: '2020-03-14 12:53:24.000000',
	},
];

/**
 * Returns question status text based on status key
 *
 * @param {string} value The status key
 * @returns {string} Status text
 */
export const getQuestionStatusText = (value) =>
	({
		[questionsStatusEnum.QUESTION_ANSWERED]: 'Respondida',
		[questionsStatusEnum.QUESTION_NOT_ANSWERED]: 'Sem resposta',
		[questionsStatusEnum.QUESTION_REFUSED]: 'Recusada',
	}[value]);

const Questions = ({ questions, currentPage, totalPages, totalItems, currentSort }) => {
	const { t } = useTranslation(['helper', 'account']);
	const router = useRouter();
	const { openModal } = useModal();

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
				<MainContentContainer>
					<Title align="left" noPadding noMargin>
						{t('account:titles.questions')}
					</Title>
					<MainContent>
						{questions.length ? (
							<DataGrid
								data={questions.map((question) => {
									const { id, technology, user, status, created_at } = question;

									return {
										id,
										Tecnologia: technology,
										Usuário: user,
										Status: (
											<QuestionStatus status={status}>
												{getQuestionStatusText(status)}
											</QuestionStatus>
										),
										'Data da pergunta': dateToString(created_at),
										Ações: (
											<QuestionActions>
												<IconButton
													variant="gray"
													aria-label="Question details"
													onClick={() => openModal('questionDetails')}
												>
													<FiEye />
												</IconButton>
											</QuestionActions>
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
							<NoQuestions>{t('account:messages.noQuestionsToShow')}</NoQuestions>
						)}
					</MainContent>
				</MainContentContainer>
			</Protected>
		</Container>
	);
};

Questions.propTypes = {
	questions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
	currentPage: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	totalItems: PropTypes.number.isRequired,
	currentSort: PropTypes.shape({
		by: PropTypes.string,
		order: PropTypes.string,
	}),
};

Questions.defaultProps = {
	currentSort: {},
};

Questions.getInitialProps = async (ctx) => {
	const { query } = ctx;

	const page = Number(query.page) || 1;

	return {
		questions: questionsMock,
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

export const NoQuestions = styled.span`
	color: ${({ theme }) => theme.colors.darkGray};
	font-size: 2rem;
`;

const statusModifiers = {
	[questionsStatusEnum.QUESTION_ANSWERED]: (colors) => css`
		color: ${colors.secondary};
		&::before {
			background: ${colors.secondary};
		}
	`,
	[questionsStatusEnum.QUESTION_NOT_ANSWERED]: (colors) => css`
		color: ${colors.lightGray2};
		&::before {
			background: ${colors.lightGray2};
		}
	`,
	[questionsStatusEnum.QUESTION_REFUSED]: (colors) => css`
		color: ${colors.red};
		&::before {
			background: ${colors.red};
		}
	`,
};

export const QuestionStatus = styled.div`
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

		${!!status && statusModifiers[status]?.(colors)};
	`}
`;

export const QuestionActions = styled.div`
	${({ theme: { screens } }) => css`
		display: flex;
		justify-content: center;

		> button:not(:last-child) {
			margin-right: 2.4rem;
		}

		svg {
			font-size: 1.4rem;
			stroke-width: 3;
		}

		@media screen and (max-width: ${screens.large}px) {
			justify-content: flex-start;
		}
	`}
`;

export default Questions;
