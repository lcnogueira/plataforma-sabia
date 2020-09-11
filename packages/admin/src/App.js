import React from 'react';
import { Admin, Resource } from 'react-admin';
import authProvider from './providers/authProvider';
import dataProvider from './providers/dataProvider';
import i18nProvider from './providers/i18nProvider';

import { LoginPage } from './components/Auth';
import Layout from './components/Layout';
import routes from './routes';

import { TechnologiesList, TechnologiesCreate, TechnologiesEdit } from './pages/technologies';
import { TermsList, TermsCreate, TermsEdit } from './pages/terms';
import { TaxonomyList, TaxonomyCreate, TaxonomyEdit } from './pages/taxonomy';
import { UsersList, UsersCreate, UsersEdit } from './pages/users';
import { RolesList, RolesCreate, RolesEdit } from './pages/roles';
import { PermissionsList, PermissionsCreate, PermissionsEdit } from './pages/permissions';

const App = () => {
	return (
		<Admin
			loginPage={LoginPage}
			authProvider={authProvider}
			dataProvider={dataProvider}
			i18nProvider={i18nProvider}
			layout={Layout}
			customRoutes={routes}
		>
			<Resource
				name="technologies"
				list={TechnologiesList}
				create={TechnologiesCreate}
				edit={TechnologiesEdit}
			/>
			<Resource name="terms" list={TermsList} create={TermsCreate} edit={TermsEdit} />
			<Resource
				name="taxonomies"
				list={TaxonomyList}
				create={TaxonomyCreate}
				edit={TaxonomyEdit}
			/>
			<Resource name="users" list={UsersList} create={UsersCreate} edit={UsersEdit} />
			<Resource name="roles" list={RolesList} create={RolesCreate} edit={RolesEdit} />
			<Resource
				name="permissions"
				list={PermissionsList}
				create={PermissionsCreate}
				edit={PermissionsEdit}
			/>
		</Admin>
	);
};
export default App;
