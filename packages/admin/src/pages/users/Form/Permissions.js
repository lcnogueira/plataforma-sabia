import PropTypes from 'prop-types';
import React from 'react';
import { CheckboxGroupInput, SimpleForm } from 'react-admin';
import { ReferenceArrayInput } from '../../../components';

const Permissions = ({ record, save, resource }) => {
	const permissions = record?.permissions.map((permission) => permission.id);
	const newRecord = {
		permissions,
	};
	return (
		<SimpleForm record={newRecord} save={save} resource={resource}>
			<ReferenceArrayInput source="permissions" reference="permissions">
				<CheckboxGroupInput optionText="description" row={false} />
			</ReferenceArrayInput>
		</SimpleForm>
	);
};

Permissions.propTypes = {
	record: PropTypes.shape({}),
	resource: PropTypes.string,
	save: PropTypes.func,
};

Permissions.defaultProps = {
	record: {},
	resource: '',
	save: () => {},
};

export default Permissions;
