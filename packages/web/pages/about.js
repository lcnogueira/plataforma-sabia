import React, { useEffect } from 'react';
import { Element, scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useModal, useAuth } from '../hooks';
import { toast } from '../components/Toast';

import { Intro, About, Features, Resources, Contact } from '../components/LandingPage';

const Welcome = () => {
	const router = useRouter();
	const { t } = useTranslation(['common']);
	const { user } = useAuth();
	const { openModal } = useModal();

	const handleIntroButtonClick = (e) => {
		e.preventDefault();
		if (!user?.email) {
			openModal('login', { message: t('common:signInToContinue'), redirectTo: '/' });
		} else {
			toast.info('Você está sendo redireciondo para o início');
			router.push('/');
		}
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const routerHref = router.asPath.split('#')[1];

			if (routerHref) {
				scroller.scrollTo(routerHref, {
					duration: 1,
					offset: -65,
					smooth: true,
				});
			}
		}
	}, [router.asPath]);

	return (
		<>
			<Element id="intro" name="intro" className="element">
				<Intro
					title="A vitrine tecnológica mais completa do semiárido"
					subtitle="Um ambiente digital interativo voltado a difundir as tecnologias demandadas e
					ofertadas na resolução de problemas do semiárido brasileiro."
					image={{
						src: '/search-engines-rafiki.svg',
						alt:
							'Mulher de costas segurando uma lupa gigante e olhando para uma barra de busca gigante',
					}}
					button={{
						label: 'Acesse agora',
						handleButtonClick: handleIntroButtonClick,
					}}
				/>
				<About />
			</Element>
			<Element id="features" name="features" className="element">
				<Features />
			</Element>
			<Element id="resources" name="resources" className="element">
				<Resources />
			</Element>
			<Element id="contact" name="contact" className="element">
				<Contact />
			</Element>
		</>
	);
};

export default Welcome;
