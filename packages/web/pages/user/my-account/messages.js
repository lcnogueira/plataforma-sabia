import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../components/UserProfile';
import { Protected } from '../../../components/Authorization';
import { getUserMessages, toggleReadStatus } from '../../../services';
import { Title } from '../../../components/Common';
import { STATUS as statusEnum } from '../../../utils/enums/messages.enum';
import { COMMON_COLUMNS } from '../../../utils/enums/api.enum';
import { formatDateLong, stringToLocaleDate, stripHTML } from '../../../utils/helper';
import { SafeHtml } from '../../../components/SafeHtml';
import { RectangularButton } from '../../../components/Button';
import EmptyScreen from '../../../components/EmptyScreen';
import { Spinner } from '../../../components/Loading';
import Controls from '../../../components/DataGrid/Controls';

const itemsPerPage = 20;

const Messages = ({
	initialMessages,
	initialTotalPages,
	initialTotalItems,
	requestMessagesOptions,
}) => {
	const [activeMessage, setActiveMessage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { t } = useTranslation(['account']);
	const router = useRouter();

	const {
		data: { messages = [], totalPages, totalItems },
		isValidating: isValidatingMessages,
		revalidate,
		mutate,
	} = useSWR(['getUserMessages', router.query], () => getUserMessages(requestMessagesOptions), {
		initialData: {
			messages: initialMessages,
			totalPages: initialTotalPages,
			totalItems: initialTotalItems,
		},
		revalidateOnFocus: false,
	});

	const handleToggleMessageRead = async (message, forceToggleRead = false) => {
		setIsSubmitting(true);

		const messageIsUnread = message.status === statusEnum.NEW;
		const newReadStatus = messageIsUnread ? statusEnum.READ : statusEnum.NEW;
		const newMessage = { ...message };

		if (messageIsUnread || forceToggleRead) {
			const updatedMessages = messages.map((msg) => {
				if (msg.id === message.id) {
					return { ...msg, status: newReadStatus };
				}

				return msg;
			});

			mutate({ messages: updatedMessages, totalPages, totalItems }, false);

			const result = await toggleReadStatus(message.id, message.status);
			if (result) {
				newMessage.status = newReadStatus;
			}

			revalidate();
		}

		setActiveMessage(newMessage);
		setIsSubmitting(false);
	};

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

	const isLoading = isValidatingMessages || isSubmitting;

	return (
		<Container>
			<Protected>
				<UserProfile />
				<MainContentContainer>
					{messages.length ? (
						<>
							<TitleWrapper>
								<Title align="left" noMargin>
									Caixa de mensagens
								</Title>
								{isLoading && <Spinner noPadding />}
							</TitleWrapper>

							<MessagesContainer>
								<ListWrapper>
									<Controls
										handlePagination={handlePagination}
										data={messages}
										totalPages={totalPages}
										totalItems={totalItems}
										currentPage={requestMessagesOptions.page}
										itemsPerPage={itemsPerPage}
									/>
									<MessageList>
										{messages.map((message) => (
											<MessageListItem
												key={message.id}
												unread={message.status === statusEnum.NEW}
												onClick={() => handleToggleMessageRead(message)}
												role="button"
											>
												<MessageSubject>
													<p>{message.subject}</p>
													<span>
														{stringToLocaleDate(message.created_at)}
													</span>
												</MessageSubject>
												<MessageShortContent>
													{stripHTML(
														SafeHtml({
															html: message.content,
															shouldParse: false,
														}),
													)}
												</MessageShortContent>
											</MessageListItem>
										))}
									</MessageList>
								</ListWrapper>

								<MessageContent>
									{!!activeMessage && (
										<>
											<MessageHeader>
												<div>
													<span>
														{formatDateLong(
															activeMessage.created_at,
															undefined,
															{
																hour: '2-digit',
																minute: '2-digit',
															},
														)}
													</span>
													<RectangularButton
														variant="outlined"
														colorVariant="green"
														onClick={() =>
															handleToggleMessageRead(
																activeMessage,
																true,
															)
														}
														disabled={isLoading}
													>
														Marcar como{' '}
														{activeMessage.status === statusEnum.NEW
															? 'lida'
															: 'não lida'}
													</RectangularButton>
												</div>
												<p>{activeMessage.subject}</p>
											</MessageHeader>
											<MessageText>
												<SafeHtml html={activeMessage.content} />
											</MessageText>
										</>
									)}
								</MessageContent>
							</MessagesContainer>
						</>
					) : (
						<EmptyScreen message={t('account:messages.noChatMessagesToShow')} />
					)}
				</MainContentContainer>
			</Protected>
		</Container>
	);
};

Messages.getInitialProps = async ({ query }) => {
	const page = Number(query.page) || 1;

	const requestMessagesOptions = {
		orderBy: COMMON_COLUMNS.CREATED_AT,
		order: 'DESC',
		perPage: itemsPerPage,
		page,
	};

	const { messages = [], totalPages = 0, totalItems = 0 } = await getUserMessages(
		requestMessagesOptions,
	);

	return {
		initialMessages: messages,
		initialTotalPages: totalPages,
		initialTotalItems: totalItems,
		requestMessagesOptions,
	};
};

Messages.propTypes = {
	initialMessages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
	initialTotalPages: PropTypes.number.isRequired,
	initialTotalItems: PropTypes.number.isRequired,
	requestMessagesOptions: PropTypes.shape({
		page: PropTypes.number,
	}).isRequired,
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

const TitleWrapper = styled.div`
	display: flex;
	align-items: center;

	> :first-child {
		margin-right: 1.4rem;
	}
`;

const MessagesContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 3.2rem;
	margin-top: 1.6rem;
`;

const ListWrapper = styled.div`
	flex: 1;
	min-width: min(47rem, 100%);
`;

const MessageList = styled.ul`
	${({ theme: { colors, metrics } }) => css`
		height: 54rem;
		overflow-y: auto;

		padding: 0.8rem 0;

		border-radius: ${metrics.baseRadius}rem;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
		background-color: ${colors.white};
	`}
`;

const MessageSubject = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 1.4rem;
	line-height: 2.4rem;

	> span {
		margin-left: 0.8rem;
	}
`;

const MessageShortContent = styled.p`
	${({ theme: { colors } }) => css`
		font-size: 1.2rem;
		line-height: 1.6rem;
		color: ${colors.lightGray2};

		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	`}
`;

const MessageListItem = styled.li`
	${({ theme: { colors }, unread }) => css`
		padding: 1.2rem;
		cursor: pointer;

		${unread
			? css`
					background-color: ${colors.lightGray4};
					${MessageSubject} {
						font-weight: bold;
					}
			  `
			: css`
					background-color: ${colors.white};
					&:nth-child(even) {
						background-color: ${colors.whiteSmoke};
					}
			  `}
	`}
`;

const MessageContent = styled.div`
	flex: 1;
	min-width: min(30rem, 100%);
	overflow-y: auto;
	height: 58rem;
`;

const MessageText = styled.div`
	${({ theme: { colors } }) => css`
		color: ${colors.black};
		font-size: 1.4rem;
		line-height: 2.4rem;

		margin-top: 1.6rem;

		> button:last-child {
			margin-top: 3.2rem;
		}
	`}
`;

const MessageHeader = styled.div`
	${({ theme: { colors } }) => css`
		> div > span {
			color: ${colors.lightGray2};
			font-size: 1.4rem;
			line-height: 1.6rem;
			margin-bottom: 0.8rem;
			padding-top: 1rem;
		}

		> p {
			color: ${colors.silver};
			font-size: 2.4rem;
			line-height: 2.8rem;
		}

		> div {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 1rem;
		}

		padding-bottom: 1.6rem;
		border-bottom: 1px solid ${colors.lightGray4};
	`}
`;

export default Messages;
