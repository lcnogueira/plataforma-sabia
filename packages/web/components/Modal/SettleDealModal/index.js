import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { ReviewButton as Button } from '../CurateTechnologyModal/styles';
import { toast } from '../../Toast';
import { Modal, InfosContainer, Summary } from './styles';
import { CurrencyInputField, InputField } from '../../Form';
import { formatCurrencyToInt, formatMoney } from '../../../utils/helper';
import { settleADeal } from '../../../services';

const SettleDealModal = ({ closeModal, id }) => {
	const [totalValue, setTotalValue] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm();
	const { watch } = form;
	const formValues = watch();

	const onSubmit = async () => {
		setIsSubmitting(true);
		const { quantity, unit_value } = formValues;

		const result = await settleADeal(id, {
			quantity,
			unit_value: formatCurrencyToInt(unit_value),
		});

		if (result) {
			toast.success('Pedido fechado com sucesso');
		} else {
			toast.error('Ocorreu um erro ao fechar pedido. Tente novamente mais tarde.');
		}

		setIsSubmitting(false);
		closeModal();
	};

	useEffect(() => {
		const { quantity, unit_value } = formValues;

		if (quantity && unit_value) {
			const intCurrency = formatCurrencyToInt(unit_value);
			const total = intCurrency * quantity;

			setTotalValue(total);
		} else {
			setTotalValue(0);
		}
	}, [formValues]);

	return (
		<Modal onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<div>
				<img
					src="/checkout-rafiki.svg"
					alt="Ilustração de uma moça registrando compras em um computador"
				/>
			</div>

			<InfosContainer>
				<h3>Deseja fechar este pedido?</h3>

				<CurrencyInputField
					form={form}
					label="Valor unitário negociado"
					name="unit_value"
					placeholder="R$ 0,00"
					variant="gray"
					validation={{ required: true }}
				/>

				<InputField
					form={form}
					name="quantity"
					placeholder="Quantidade negociada"
					label="Quantidade negociada"
					validation={{
						required: true,
						pattern: {
							value: /^[0-9]*$/,
							message: 'Você deve digitar apenas números positivos',
						},
					}}
					type="number"
					min="0"
					variant="gray"
				/>

				<Summary>
					<span>Valor total</span>
					<span>{formatMoney(totalValue)}</span>
				</Summary>

				<div>
					<Button variant="deny" type="button" onClick={closeModal}>
						Cancelar
					</Button>
					<Button variant="approve" disabled={isSubmitting}>
						Fechar pedido
					</Button>
				</div>
			</InfosContainer>
		</Modal>
	);
};

SettleDealModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SettleDealModal;
