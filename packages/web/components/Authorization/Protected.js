/* eslint-disable consistent-return */
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useModal } from '../../hooks';
import NotAuthorized from './NotAuthorized';
import InlineLogin from './InlineLogin';

const Protected = ({
	children,
	redirectTo,
	role,
	inline,
	onlyUnauthorizedMessage,
	messageSize,
}) => {
	const { t } = useTranslation(['common']);
	const { openModal } = useModal();
	const { user } = useAuth();
	const router = useRouter();

	const isLoggedIn = !!user?.email;
	const isAuthorized = isLoggedIn && (role ? role === user.role : true);

	useEffect(() => {
		if (onlyUnauthorizedMessage) {
			return;
		}

		if (!isLoggedIn && !inline) {
			return openModal('login', {
				message: t('common:signInToContinue'),
			});
		}

		if (!isAuthorized && redirectTo) {
			router.push(redirectTo);
		}

		return () => {};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggedIn, openModal, router, redirectTo, isAuthorized, onlyUnauthorizedMessage, inline]);

	const NotAuthorizedComponent = inline ? <InlineLogin /> : <NotAuthorized size={messageSize} />;

	return isAuthorized ? <>{children}</> : NotAuthorizedComponent;
};

Protected.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
	redirectTo: PropTypes.string,
	role: PropTypes.string,
	inline: PropTypes.bool,
	onlyUnauthorizedMessage: PropTypes.bool,
	messageSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Protected.defaultProps = {
	redirectTo: '',
	role: '',
	inline: false,
	onlyUnauthorizedMessage: false,
	messageSize: null,
};

export default Protected;
