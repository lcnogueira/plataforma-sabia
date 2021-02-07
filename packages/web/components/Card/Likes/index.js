import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useAuth, useModal } from '../../../hooks';
import { handleBookmark } from '../../../services';
import { Container } from './styles';

const Likes = ({ id, count, colorVariant }) => {
	const [filled, setFilled] = useState(null);
	const [currentLikes, setCurrentLikes] = useState(count);
	const [animation, setAnimation] = useState(null);

	const { t } = useTranslation(['common']);
	const { user } = useAuth();
	const { openModal } = useModal();

	const userIsLoggedIn = !!user?.id;
	const animationTimeInMilliseconds = 1500;

	useEffect(() => {
		const isLiked = user?.bookmarks?.some((bookmark) => bookmark === id);

		setFilled(isLiked);
	}, [id, user]);

	async function handleLike(e) {
		e.preventDefault();

		if (!userIsLoggedIn) {
			return openModal('login', {
				message: t('common:signInToBookmarkTech'),
			});
		}

		// returns if there is a current animation running
		if (animation) {
			return null;
		}

		setAnimation(filled ? 'dislike' : 'like');

		setFilled(!filled);

		setTimeout(() => {
			setCurrentLikes(filled ? currentLikes - 1 : currentLikes + 1);
		}, animationTimeInMilliseconds / 2);

		setTimeout(() => {
			setAnimation(null);
		}, animationTimeInMilliseconds);

		return handleBookmark({
			active: filled,
			technologyId: id,
			userId: user?.id,
		});
	}

	return (
		<Container
			onClick={handleLike}
			animation={animation}
			duration={animationTimeInMilliseconds / 1000}
			colorVariant={colorVariant}
			filled={filled}
		>
			{filled ? <AiFillHeart /> : <AiOutlineHeart />}
			<span>{currentLikes}</span>
		</Container>
	);
};

Likes.propTypes = {
	id: PropTypes.number.isRequired,
	count: PropTypes.number.isRequired,
	colorVariant: PropTypes.string,
};

Likes.defaultProps = {
	colorVariant: 'default',
};

export default Likes;
