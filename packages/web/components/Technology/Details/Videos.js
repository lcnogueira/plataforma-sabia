import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const Container = styled.section`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
`;

const Video = styled.section`
	${({ theme: { colors, screens } }) => css`
		width: 316px;
		display: flex;
		flex-direction: column;
		margin: 0 8px 16px;

		a {
			display: block;
			padding: 0;
			margin-bottom: 10px;

			&:hover {
				opacity: 0.7;
			}
		}

		img {
			background: ${colors.lightGray2};
			width: 100%;
			display: block;
		}

		@media (max-width: ${screens.large}px) {
			width: 100%;
		}
	`}
`;

const Videos = ({ data }) => (
	<Container>
		{data.map((video) => (
			<Video key={`video_${video.videoId}`}>
				<a
					href={`//www.youtube.com/watch?v=${video.videoId}`}
					target="_blank"
					rel="noreferrer"
				>
					<img src={video.thumbnail} alt={`Youtube vídeo ${video.videoId}`} />
				</a>
			</Video>
		))}
	</Container>
);

Videos.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default Videos;