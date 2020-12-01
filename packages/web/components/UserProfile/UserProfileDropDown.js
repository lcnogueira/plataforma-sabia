import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LogoutButton from './LogoutButton';
import PageLink from './PageLink';
import getPages from './pages';
import { useAuth } from '../../hooks';
import { STATUS as questionsStatusEnum } from '../../utils/enums/questions.enum';
import { getUserQuestions } from '../../services/user';

const UserProfileDropDown = ({ visible, toggleVisible }) => {
	const { t } = useTranslation(['profile']);
	const { user } = useAuth();
	const [questions, setQuestions] = useState(null);

	const {
		data: { data },
		isValidating,
	} = useSWR(['getUserQuestions'], () => getUserQuestions(), {
		initialData: [],
		revalidateOnMount: true,
	});

	useEffect(() => {
		if (!isValidating) {
			const unansweredQuestions = data?.filter(
				(question) => question.status === questionsStatusEnum.QUESTION_UNANSWERED,
			).length;
			setQuestions(unansweredQuestions);
		}
	}, [isValidating, data]);

	return (
		visible && (
			<DropDownContainer>
				<DropDownMenu>
					{getPages(t, user, questions).map(({ pages }) =>
						pages.map((page) => (
							<li key={page.title}>
								<PageLink
									href={page.href}
									onClick={toggleVisible}
									notification={page?.notification}
								>
									<page.icon />
									{page.title}
								</PageLink>
							</li>
						)),
					)}
					<li>
						<LogoutButton cb={toggleVisible} />
					</li>
				</DropDownMenu>
			</DropDownContainer>
		)
	);
};

UserProfileDropDown.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggleVisible: PropTypes.func.isRequired,
};

const DropDownContainer = styled.div`
	position: relative;
`;

const DropDownMenu = styled.ul`
	${({ theme: { colors, metrics } }) => css`
		position: absolute;
		width: 22rem;
		left: calc(50% - 11rem);
		top: calc(100% + 2.1rem);
		background: ${colors.white};
		border-radius: ${metrics.baseRadius}rem;
		padding: 2rem 1.5rem;
		box-shadow: 0 0 2rem -1.5rem ${colors.secondary};
		transition: 0.3s;

		:hover {
			box-shadow: 0 0 2.2rem -1.5rem ${colors.secondary};
		}

		&::before {
			content: '';
			position: absolute;
			left: calc(50% - 2rem);
			top: -2rem;
			width: 0;
			height: 0;
			border-left: 2rem solid transparent;
			border-right: 2rem solid transparent;
			border-bottom: 2rem solid ${colors.white};
		}

		li:last-child {
			padding-top: 1rem;
			border-top: 0.1rem solid ${colors.border};
		}
	`}
`;

export default UserProfileDropDown;
