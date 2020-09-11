import React, { useState } from 'react';
import useSWR from 'swr';
import { useTechnology } from '../../../../../hooks';
import { getReviews } from '../../../../../services/technology';
import * as Layout from '../../../../Common/Layout';
import Loading from '../../../../Loading';
import Rating from '../../../../Rating';
import Section from '../../Section';
import { Protected } from '../../../../Authorization';
import {
	SelectContainer,
	Item,
	Header,
	FullName,
	Text,
	PointsContainer,
	PointsTitle,
	PointsItem,
	PositiveIcon,
	NegativeIcon,
} from './styles';

const selectOptions = [
	{ label: 'Mais Recentes', value: 'created_at|DESC' },
	{ label: 'Mais Bem Avaliados', value: 'rating|DESC' },
	{ label: 'Mais Antigos', value: 'created_at|ASC' },
];

const getOrderValue = (raw) => {
	const [orderBy, order] = raw.split('|');
	return { orderBy, order };
};

const Review = () => {
	const { technology } = useTechnology();
	const [ordering, setOrdering] = useState(selectOptions[0].value);

	const { data: reviews, isValidating } = useSWR(
		['getReviews', technology.id, ordering],
		(_, id, order) => getReviews(id, getOrderValue(order)),
		{
			initialData: technology.reviews,
		},
	);

	const handleOrderBy = (event) => setOrdering(event.target.value);

	return (
		<Layout.Cell>
			<Section title="Relatos" hideWhenIsEmpty={false}>
				<Protected inline>
					{reviews.length ? (
						<>
							<SelectContainer>
								<select name="order" value={ordering} onChange={handleOrderBy}>
									{selectOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</SelectContainer>

							<Loading loading={isValidating}>
								<ul>
									{reviews?.map((review) => (
										<Item key={review.id}>
											<Header>
												<div>
													<FullName>{review.user?.full_name}</FullName>
													<Text>
														<span>{review.user?.company}, </span>
														<span>{review.user?.city}/</span>
														<span>{review.user?.state}, </span>
														<span>{review.user?.country}</span>
													</Text>
												</div>

												<Rating value={review.rating} size={2} readonly />
											</Header>

											<Text>{review?.content}</Text>

											<PointsContainer>
												{review.positive && (
													<ul>
														<PointsTitle positive>
															Pontos positivos:
														</PointsTitle>
														{review.positive.map((item) => (
															<PointsItem key={item} positive>
																<PositiveIcon />
																<Text>{item}</Text>
															</PointsItem>
														))}
													</ul>
												)}
												{review.negative && (
													<ul>
														<PointsTitle>Pontos negativos:</PointsTitle>
														{review.negative.map((item) => (
															<PointsItem key={item}>
																<NegativeIcon />
																<Text>{item}</Text>
															</PointsItem>
														))}
													</ul>
												)}
											</PointsContainer>
										</Item>
									))}
								</ul>
							</Loading>
						</>
					) : (
						<p>Nenhum relato cadastrado até o momento</p>
					)}
				</Protected>
			</Section>
		</Layout.Cell>
	);
};

export default Review;
