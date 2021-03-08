import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';

import { formatMoney } from '../../utils/helper';
import { useShoppingCart } from '../../hooks';
import { RectangularButton } from '../Button';
import Likes from './Likes';
import {
	CardContainer,
	ImageContainer,
	Badge,
	Content,
	Price,
	MainTitle,
	TextContainer,
	InstitutionText,
	LikesWrapper,
	ButtonContent,
} from './styles';

const ServiceCard = ({ id, name, price, thumbnail, likes, user, measure_unit: measureUnit }) => {
	const { addItem, itemIsInCart } = useShoppingCart();

	const handleAddToCart = () => {
		addItem({
			id,
			name,
			price,
			thumbnail,
			institution: user.institution?.name || '',
			type: 'service',
			quantity: 1,
			measureUnit,
		});
	};

	const serviceIsInCart = itemIsInCart(id, 'service');

	return (
		<CardContainer>
			<ImageContainer>
				<Image
					src={thumbnail?.url || '/card-image.jpg'}
					alt={name}
					layout="responsive"
					width={256}
					height={304}
				/>
				<Badge bottom>Serviço</Badge>
			</ImageContainer>
			<Content>
				<LikesWrapper data-testid="card-heart">
					<Likes id={id} count={likes} type="service" />
				</LikesWrapper>
				{!!price && <Price>{formatMoney(price)}</Price>}
				<MainTitle data-testid="card-title">{name}</MainTitle>
				<InstitutionText>{user?.institution?.name}</InstitutionText>
				<TextContainer>
					<RectangularButton
						variant="filled"
						colorVariant="green"
						onClick={handleAddToCart}
						disabled={serviceIsInCart}
					>
						<ButtonContent>
							<FiShoppingCart fontSize={18} />
							{serviceIsInCart ? 'Item no carrinho' : 'Adicionar ao carrinho'}
						</ButtonContent>
					</RectangularButton>
				</TextContainer>
			</Content>
		</CardContainer>
	);
};

ServiceCard.propTypes = {
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	price: PropTypes.number.isRequired,
	thumbnail: PropTypes.string,
	likes: PropTypes.number,
	user: PropTypes.shape({
		institution: PropTypes.shape({ name: PropTypes.string }),
	}).isRequired,
	measure_unit: PropTypes.string.isRequired,
};

ServiceCard.defaultProps = {
	thumbnail: null,
	likes: 0,
};

export default ServiceCard;
