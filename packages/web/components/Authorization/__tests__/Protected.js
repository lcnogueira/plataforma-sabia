/* eslint-disable jsx-a11y/aria-role */
import React from 'react';
import { render } from 'test-utils';
import * as Router from 'next/router';
import { Protected } from '..';
import * as useAuth from '../../../hooks/useAuth';

describe('Protected component', () => {
	it('should return the login modal if user is not logged in', () => {
		const childrenText = 'children';

		const { container, queryByTestId } = render(
			<Protected>
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(container.querySelector('h1').textContent).not.toEqual(childrenText);
		expect(queryByTestId('modal')).toBeTruthy();
		expect(container.querySelector('form input[type=email]')).toBeTruthy();
		expect(container.querySelector('form input[type=password]')).toBeTruthy();
		expect(container.querySelector('form button[type=submit]')).toBeTruthy();
	});

	it('should render children if user is logged in and the component does not require a role', () => {
		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email: 'test@test.com',
			},
		});

		const childrenText = 'children';

		const { container } = render(
			<Protected>
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(container.querySelector('h1').textContent).toEqual(childrenText);
	});

	it('should render children if user is logged in and has the role', () => {
		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email: 'test@test.com',
				role: 'admin',
			},
		});

		const childrenText = 'children';

		const { container } = render(
			<Protected role="admin">
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(container.querySelector('h1').textContent).toEqual(childrenText);
	});

	it('should not render children if user is logged in and does not have the role', () => {
		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email: 'test@test.com',
				role: 'moderator',
			},
		});

		const childrenText = 'children';

		const { container, getByTestId } = render(
			<Protected role="admin">
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(getByTestId('notAuthorized')).toBeInTheDocument();
		expect(container.querySelector('h1').textContent).not.toEqual(childrenText);
	});

	it('should redirect to another page when user is not logged in and component have a redirect prop', () => {
		jest.spyOn(Router, 'useRouter').mockReturnValue({
			push: jest.fn(),
		});

		const childrenText = 'children';
		const redirectTo = '/';

		const { container } = render(
			<Protected role="admin" redirectTo={redirectTo}>
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(container.querySelector('h1').textContent).not.toEqual(childrenText);
		expect(Router.useRouter().push).toHaveBeenCalledWith(redirectTo);
		expect(Router.useRouter().push).toHaveBeenCalledTimes(1);
	});

	it('should show an inline login when inline props was passed', () => {
		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email: null,
			},
		});

		const childrenText = 'children';

		const { container, queryByTestId } = render(
			<Protected inline>
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(queryByTestId('modal')).toBeNull();
		expect(container.querySelector('form input[type=email]')).toBeTruthy();
		expect(container.querySelector('form input[type=password]')).toBeTruthy();
		expect(container.querySelector('form button[type=submit]')).toBeTruthy();
	});

	it('should return only the inline message when onlyUnauthorizedMessage is provided', () => {
		const childrenText = 'children';

		jest.spyOn(useAuth, 'default').mockReturnValue({
			user: {
				email: null,
			},
		});

		const { container, queryByTestId } = render(
			<Protected onlyUnauthorizedMessage>
				<h1>{childrenText}</h1>
			</Protected>,
		);

		expect(container).toMatchSnapshot();
		expect(container.querySelector('h1').textContent).not.toEqual(childrenText);
		expect(queryByTestId('modal')).not.toBeTruthy();
		expect(queryByTestId('notAuthorized')).toBeTruthy();
		expect(container.querySelector('form input[type=email]')).not.toBeTruthy();
		expect(container.querySelector('form input[type=password]')).not.toBeTruthy();
		expect(container.querySelector('form button[type=submit]')).not.toBeTruthy();
	});
});
