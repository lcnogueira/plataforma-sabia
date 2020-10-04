import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useModal, useAuth } from '../../hooks';
import { SafeHtml } from '../SafeHtml';

const NewTechnologyButton = () => {
	const { t } = useTranslation(['common']);
	const { openModal } = useModal();
	const { user } = useAuth();

	const url = '/technology/new';

	const handleClick = (e) => {
		if (!user.email) {
			e.preventDefault();
			openModal('login', {
				message: t('common:signInToContinue'),
				redirectTo: url,
			});
		}
	};

	return (
		<Link href={url} passHref>
			<Button onClick={handleClick}>
				<SafeHtml html={t('common:registerTechonology')} />
			</Button>
		</Link>
	);
};

const Button = styled.a`
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 3.5rem;
	text-transform: uppercase;
	letter-spacing: 0.2rem;
	font-size: 1.6rem;
	font-weight: 500;
	line-height: 1.8rem;
	background-color: ${({ theme }) => theme.colors.primary};
	color: ${({ theme }) => theme.colors.white};
	text-align: center;

	:hover {
		background-color: ${({ theme }) => theme.colors.darkOrange};
		cursor: pointer;
	}

	span {
		display: block;
	}

	@media (max-width: ${({ theme }) => theme.screens.medium}px) {
		display: none;
	}
`;

export default NewTechnologyButton;
