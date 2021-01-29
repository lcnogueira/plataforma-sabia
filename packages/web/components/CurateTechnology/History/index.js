import React from 'react';

import DOMPurify from 'isomorphic-dompurify';
import EmptyScreen from '../../EmptyScreen';
import { useTechnology } from '../../../hooks';
import { stringToLocaleDate } from '../../../utils/helper';
import { Container, ContentBox } from '../styles';
import * as S from './styles';

const History = () => {
	const { technology } = useTechnology();

	const comments = [...technology.technologyRevisionsHistory].reverse();

	return (
		<Container>
			<ContentBox flexBasis="100%">
				{comments.length ? (
					comments.map((comment) => (
						<S.Comment key={comment.id}>
							<S.CommentTitle>
								<p>
									{comment.reviewer
										? 'Comentários do curador'
										: 'Comentários do pesquisador'}
								</p>
							</S.CommentTitle>

							<S.CommentContent>
								<span>
									{stringToLocaleDate(comment.created_at, {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
								<S.CommentText
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: DOMPurify.sanitize(
											comment.comment || comment.description,
										),
									}}
								/>
							</S.CommentContent>
						</S.Comment>
					))
				) : (
					<EmptyScreen message="Não existe histórico a ser exibido até o momento" />
				)}
			</ContentBox>
		</Container>
	);
};

export default History;
