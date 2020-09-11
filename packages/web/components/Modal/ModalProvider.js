import React, { useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AiFillCloseCircle } from 'react-icons/ai';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { ModalOverlay, Modal, ModalCloseIcon } from './styles';
import ModalContext from './ModalContext';
import EmailConfirmationModal from './EmailConfirmationModal';

const INITIAL_STATE = {
	modal: '',
	props: {},
};

const modalReducer = (state, action) => {
	const { type, payload } = action;

	switch (type) {
		case 'OPEN_MODAL':
			return {
				modal: payload.name,
				props: payload.props,
			};
		case 'CLOSE_MODAL':
			return INITIAL_STATE;
		default:
			throw new Error('Invalid action');
	}
};

const mapping = {
	login: LoginModal,
	register: RegisterModal,
	emailConfirmation: EmailConfirmationModal,
	forgotPassword: ForgotPasswordModal,
};

const getModalComponent = (modalName) => {
	return mapping[modalName] || null;
};

export const ModalProvider = ({ children }) => {
	const [state, dispatch] = useReducer(modalReducer, INITIAL_STATE);
	const ModalComponent = getModalComponent(state.modal);

	const openModal = useCallback(
		(name, props = {}) => dispatch({ type: 'OPEN_MODAL', payload: { name, props } }),
		[],
	);
	const closeModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), []);

	return (
		<ModalContext.Provider value={{ state, openModal, closeModal }}>
			{ModalComponent && (
				<ModalOverlay>
					<Modal data-testid="modal">
						<ModalCloseIcon onClick={() => closeModal()}>
							<AiFillCloseCircle color={state.props.closerColor} />
						</ModalCloseIcon>
						{/* eslint-disable-next-line react/jsx-props-no-spreading */}
						<ModalComponent {...state.props} />
					</Modal>
				</ModalOverlay>
			)}
			{children}
		</ModalContext.Provider>
	);
};

ModalProvider.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
		.isRequired,
};

export default ModalProvider;
