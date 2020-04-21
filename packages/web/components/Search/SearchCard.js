import React from 'react';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import SearchItem from '../Link';

const SearchCard = ({ hit }) => {
	const { name, image, objectID } = hit;
	const url = `/technology/${objectID}`;
	return (
		<div>
			<img src={image} alt={name} />
			<SearchItem href={url} className="name_div">
				<Highlight attribute="name" hit={hit} tagName="span" />
			</SearchItem>
			<div>
				<Highlight attribute="description" hit={hit} tagName="span" />
			</div>
		</div>
	);
};

SearchCard.propTypes = {
	hit: PropTypes.shape({
		name: PropTypes.string,
		image: PropTypes.string,
		objectID: PropTypes.string,
	}).isRequired,
};

export default SearchCard;
