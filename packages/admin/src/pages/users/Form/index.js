import React from 'react';
import PropTypes from 'prop-types';
import { TabbedShowLayout, Tab, Error, Loading, useQuery } from 'react-admin';
import Technologies from './Technologies';
import Reviews from './Reviews';
import AboutForm from './AboutForm';
import Bookmarks from './Bookmarks';
import Institution from './Institution';
import Uploads from './Uploads';

const UsersForm = ({ record, resource, save, basePath }) => {
	const { loading, error, data: newRecord } = useQuery({
		type: 'getOne',
		resource: `users`,
		payload: {
			id: record.id,
			query: { embed: '' },
		},
	});

	if (!record.id) return <AboutForm save={save} />;

	if (error) return <Error />;
	if (loading) return <Loading />;

	return (
		<TabbedShowLayout record={newRecord} resource={resource} basePath={basePath}>
			<Tab label="labels.about" path="">
				<AboutForm save={save} />
			</Tab>
			<Tab label="labels.technologies" path="technologies">
				<Technologies />
			</Tab>
			<Tab label="labels.reviews" path="reviews">
				<Reviews />
			</Tab>
			<Tab label="labels.bookmarks" path="bookmarks">
				<Bookmarks />
			</Tab>
			<Tab label="labels.institution" path="institution">
				<Institution />
			</Tab>
			<Tab label="labels.uploads" path="uploads">
				<Uploads />
			</Tab>
		</TabbedShowLayout>
	);
};

UsersForm.propTypes = {
	record: PropTypes.shape({ id: PropTypes.number }),
	resource: PropTypes.string,
	save: PropTypes.func,
	basePath: PropTypes.string,
};

UsersForm.defaultProps = {
	record: { id: 0 },
	resource: '',
	save: () => {},
	basePath: '',
};

export default UsersForm;
