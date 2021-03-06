import React from 'react';
import PropTypes from 'prop-types';
import { Edit, SimpleShowLayout, ReferenceField, TextField } from 'react-admin';
import { StatusForm } from '../../components';

const ReviewersEdit = ({ basePath, id, resource }) => (
	<Edit id={id} basePath={basePath} resource={resource}>
		<SimpleShowLayout>
			<ReferenceField source="user_id" reference="users">
				<TextField source="full_name" />
			</ReferenceField>
			<StatusForm />
		</SimpleShowLayout>
	</Edit>
);

ReviewersEdit.propTypes = {
	id: PropTypes.string.isRequired,
	basePath: PropTypes.string.isRequired,
	resource: PropTypes.string.isRequired,
};

export default ReviewersEdit;
