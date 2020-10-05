import React from 'react';
import PropTypes from 'prop-types';
import {
	useQuery,
	Loading,
	Error,
	SelectArrayInput,
	TextInput,
	FormDataConsumer,
} from 'react-admin';

const TechnologyTermsSelect = ({ record }) => {
	let selectInputs;
	const refs = [];

	const taxonomies = useQuery({
		type: 'getList',
		resource: 'taxonomies',
		payload: {
			pagination: {
				page: 1,
				perPage: 100,
			},
			sort: {
				field: 'id',
				order: 'asc',
			},
			embed: true,
		},
	});

	const terms = useQuery({
		type: 'getList',
		resource: `technologies/${record.id}/terms`,
		payload: {
			pagination: {
				page: 1,
				perPage: 100,
			},
			sort: {
				field: 'id',
				order: 'asc',
			},
		},
	});

	if (taxonomies.loading || terms.loading) return <Loading />;
	if (taxonomies.error || terms.error) return <Error />;

	if (!taxonomies.loading && !terms.loading) {
		record.terms = terms.data.map((term) => term.id || term);

		selectInputs = taxonomies.data.map((taxonomy) => {
			const inputName = taxonomy.taxonomy + taxonomy.id;
			record[inputName] = taxonomy.terms
				.map((term) => term.id)
				.filter((term_id) => record.terms.includes(term_id));

			refs.push(inputName);

			return (
				<SelectArrayInput
					label={taxonomy.taxonomy}
					key={inputName}
					source={inputName}
					optionText="term"
					fullWidth
					choices={taxonomy.terms}
					format={(values) => values || record[inputName]}
					parse={(values) => {
						record[inputName] = values;
						return values;
					}}
				/>
			);
		});
	}

	TechnologyTermsSelect.propTypes = {
		record: PropTypes.shape({ terms: PropTypes.array, id: PropTypes.number.isRequired }),
	};

	TechnologyTermsSelect.defaultProps = {
		record: {},
	};

	return (
		<span>
			<FormDataConsumer>
				{({ formData }) => {
					formData.terms = [];
					refs.map((ref) => {
						formData.terms = [...formData.terms, ...record[ref]];
						return ref;
					});
					return (
						<TextInput
							source="terms"
							fullWidth
							resettable
							style={{ display: 'none' }}
						/>
					);
				}}
			</FormDataConsumer>
			{selectInputs}
		</span>
	);
};

export default TechnologyTermsSelect;
