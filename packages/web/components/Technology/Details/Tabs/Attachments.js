import React from 'react';
import styled, { css } from 'styled-components';
import { FaFilePdf } from 'react-icons/fa';
import { useTechnology } from '../../../../hooks';
import * as Layout from '../../../Common/Layout';
import Section from '../Section';
import * as MapAndAttachments from '../../../TechnologyForm/MapAndAttachments/styles';

const Attachments = () => {
	const { technology } = useTechnology();

	return (
		<Layout.Cell>
			<Section title="Fotos" hideWhenIsEmpty={false}>
				<UploadsTitle>Fotos da Tecnologia</UploadsTitle>
				{technology.attachments.images.length ? (
					<UploadedImages>
						{technology.attachments.images.map((element) => (
							<IconRow key={element.url}>
								<Media src={element.url} />
							</IconRow>
						))}
					</UploadedImages>
				) : (
					<p>Nenhuma foto cadastrada</p>
				)}
			</Section>

			<Section title="Documentos" hideWhenIsEmpty={false}>
				<UploadsTitle>Documentos</UploadsTitle>
				{technology.attachments.documents.length ? (
					<UploadedDocuments>
						{technology.attachments.documents.map((element) => (
							<IconRow row key={element.url}>
								<IconLink href={element.url}>
									<FaFilePdf size="2rem" /> {element.filename}
								</IconLink>
							</IconRow>
						))}
					</UploadedDocuments>
				) : (
					<p>Nenhum documento cadastrado</p>
				)}
			</Section>
		</Layout.Cell>
	);
};

const UploadsTitle = styled.span`
	${({ theme: { colors } }) => css`
		display: block;
		font-weight: 500;
		font-size: 1.4rem;
		margin-bottom: 1rem;
		text-transform: uppercase;
		color: ${colors.lightGray};

		&:not(:first-child) {
			margin-top: 1rem;
		}
	`}
`;

const UploadedDocuments = styled(MapAndAttachments.UploadedDocuments)``;

const UploadedImages = styled(MapAndAttachments.UploadedImages)``;

const IconRow = styled(MapAndAttachments.IconRow)``;

const Media = styled(MapAndAttachments.Media)``;

const IconLink = styled(MapAndAttachments.IconLink)``;

export default Attachments;
