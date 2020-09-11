import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { AiOutlineCheck } from 'react-icons/ai';
import { Form, Actions } from './Form';
import { Button } from '../Button';

const FormWizardContainer = styled.div``;

const StepsContainer = styled.div`
	width: 100%;
	background: ${({ theme }) => theme.colors.primary};
	border-top: 4px solid ${({ theme }) => theme.colors.lightGray};
	padding: 3rem 0 5rem 0;

	@media (max-width: ${({ theme }) => theme.screens.large}px) {
		padding: 1rem 0 4rem 0;
	}
`;

const MobileSteps = styled.ol`
	display: flex;
	flex-direction: column;
	align-items: center;

	div {
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;

		> li:nth-child(2) {
			font-size: 6rem;
		}

		> li:not(:last-child) {
			margin-right: 2rem;
		}
	}

	@media (min-width: ${({ theme }) => theme.screens.large}px) {
		display: none;
	}
`;

const WebSteps = styled.ol`
	display: flex;
	justify-content: center;
	align-items: center;
	list-style: none;

	@media (max-width: ${({ theme }) => theme.screens.large}px) {
		display: none;
	}
`;

const StepItem = styled.li`
	position: relative;
	display: flex;
	align-items: center;

	${({ completed }) =>
		completed &&
		css`
			> div {
				> p {
					color: ${({ theme }) => theme.colors.darkGray};
				}
				> span {
					color: ${({ theme }) => theme.colors.white};
					background: ${({ theme }) => theme.colors.darkGray};
				}
			}
		`};

	> div {
		display: flex;
		align-items: center;
		flex-direction: column;

		> p {
			height: 2rem;
		}
	}

	::after {
		content: '';
		display: block;
		position: relative;
		width: 100px;
		height: 12px;
		box-sizing: content-box;
		outline: 1px solid
			${({ theme, completed }) => (completed ? theme.colors.darkGray : theme.colors.white)};
		background: ${({ theme, completed }) =>
			completed ? theme.colors.darkGray : theme.colors.white};
	}

	:last-child ::after {
		display: none;
	}

	@media (max-width: ${({ theme }) => theme.screens.large}px) {
		::after {
			display: none;
		}
	}
`;

const StepLabel = styled.p`
	font-size: 1.4rem;
	color: ${({ theme }) => theme.colors.white};
	font-weight: 700;
	position: absolute;
	bottom: -25px;

	@media (max-width: ${({ theme }) => theme.screens.large}px) {
		position: relative;
		color: ${({ theme }) => theme.colors.darkGray};
	}
`;

const StepNumber = styled.span`
	background: ${({ theme }) => theme.colors.white};
	display: block;
	text-align: center;
	font-size: 4.5rem;
	height: 6rem;
	width: 6rem;
	line-height: 6rem;
	border-radius: 50%;
	position: relative;

	> svg {
		height: 100%;
	}
`;

const FormWizard = ({ steps, currentStep, onSubmit, onPrev, data, defaultValues, submitting }) => {
	const CurrentFormStep =
		currentStep !== '' ? steps.find((step) => step.slug === currentStep).form : steps[0].form;

	const currentStepSlug = currentStep || steps[0].slug;
	let currentStepIndex = 0;
	steps.forEach((step, i) => {
		if (step.slug === currentStepSlug) {
			currentStepIndex = i;
		}
	});

	const nextStep =
		currentStepIndex === steps.length - 1 ? false : steps[currentStepIndex + 1].slug;
	const prevStep = currentStepIndex === 0 ? false : steps[currentStepIndex - 1].slug;
	const lastStep = currentStepIndex === steps.length - 1;

	/**
	 * Handles submitting the form data for each step of the form wizard.
	 *
	 * @param {object} formData An object containing all the form data.
	 * @param {object} form A instance of the `useForm` hook.
	 */
	const handleSubmit = (formData, form) => {
		onSubmit({ data: formData, step: currentStepSlug, nextStep }, form);
	};

	/**
	 * Handles going back in the form wizard.
	 */
	const handlePrev = () => {
		window.scrollTo({ top: 0 });
		onPrev({ step: currentStepSlug, prevStep });
	};

	return (
		<FormWizardContainer>
			<StepsContainer>
				<WebSteps>
					{steps.map((step, i) => {
						const showIcon = i < currentStepIndex || typeof step.icon !== 'undefined';
						const Icon = i < currentStepIndex ? AiOutlineCheck : step.icon || null;
						return (
							<StepItem completed={i <= currentStepIndex} key={step.slug}>
								<div>
									<StepNumber>{showIcon ? <Icon /> : i + 1}</StepNumber>
									<StepLabel>{step.label}</StepLabel>
								</div>
							</StepItem>
						);
					})}
				</WebSteps>
				<MobileSteps>
					<div>
						<StepItem completed>
							<div>
								<StepNumber>{currentStepIndex + 1}</StepNumber>
							</div>
						</StepItem>
						<li>/</li>
						<StepItem>
							<div>
								<StepNumber>{steps.length}</StepNumber>
							</div>
						</StepItem>
					</div>
					<StepLabel>{steps[currentStepIndex].label}</StepLabel>
				</MobileSteps>
			</StepsContainer>

			<Form onSubmit={handleSubmit} defaultValues={defaultValues}>
				{CurrentFormStep && <CurrentFormStep data={data} />}
				<Actions center>
					{prevStep && (
						<Button variant="secondary" disabed={submitting} onClick={handlePrev}>
							Voltar
						</Button>
					)}
					{nextStep && (
						<Button disabled={submitting} type="submit">
							{submitting ? 'Salvando...' : 'Salvar e Continuar'}
						</Button>
					)}
					{lastStep && (
						<Button variant="success" disabled={submitting} type="submit">
							Concluir
						</Button>
					)}
				</Actions>
			</Form>
		</FormWizardContainer>
	);
};

FormWizard.propTypes = {
	onSubmit: PropTypes.func,
	onPrev: PropTypes.func,
	submitting: PropTypes.bool,
	steps: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			slug: PropTypes.string.isRequired,
			form: PropTypes.elementType,
			icon: PropTypes.elementType,
		}),
	).isRequired,
	currentStep: PropTypes.string.isRequired,
	data: PropTypes.shape({}),
	defaultValues: PropTypes.shape({}),
};

FormWizard.defaultProps = {
	submitting: false,
	data: {},
	defaultValues: {},
	onSubmit: () => {},
	onPrev: () => {},
};

export default FormWizard;
