/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-use-before-define */
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTrash, FaFileUpload, FaFilePdf, FaMapMarkerAlt } from 'react-icons/fa';
import Dropzone from 'react-dropzone';
import PlacesAutocomplete, { geocodeByPlaceId } from 'react-places-autocomplete';
import { upload, deleteUpload } from '../../../services/uploads';
import { createTerm } from '../../../services/terms';
import { InputField, SelectField, InputHiddenField } from '../../Form';
import {
	UploadedImages,
	UploadedDocuments,
	SvgBox,
	IconBox,
	IconTextBox,
	UploadBox,
	Suggestion,
	GoogleAddressSugestions,
	Div,
	IconLink,
	Wrapper,
	IconRow,
	Title,
	Media,
} from './styles';
import { Row, Column } from '../../Common/Layout';
import { CircularButton } from '../../Button';

const parseMetaObjectIntoKeyValue = (findTerm, terms) => {
	const filteredTerms = terms.filter(({ term }) => term === findTerm);

	const newTerms = filteredTerms.map(({ metas, id }) => {
		const parsedObject = {
			id,
		};
		metas.forEach((meta) => {
			parsedObject[meta.meta_key] = meta.meta_value;
		});
		return parsedObject;
	});

	return newTerms;
};

const MapAndAttachments = ({ form, data }) => {
	const { attachments, rawTerms: terms } = data.technology;
	const imgsRef = useRef(null);
	const pdfRef = useRef(null);
	const [whereIsAlreadyImplemented, setWhereIsAlreadyImplemented] = useState([]);
	const [whereIsAlreadyImplementedInput, setWhereIsAlreadyImplementedInput] = useState('');
	const [whoDevelop, setWhoDevelop] = useState([]);
	const [whoDevelopInput, setWhoDevelopInput] = useState('');
	const [previewedImgFiles, setPreviewedImgFiles] = useState(attachments.images);
	const [previewedPdfFiles, setPreviewedPdfFiles] = useState(attachments.documents);

	useEffect(() => {
		const whereIsAlreadyImplementedParsed = parseMetaObjectIntoKeyValue(
			'where_is_already_implemented',
			terms,
		);
		setWhereIsAlreadyImplemented(whereIsAlreadyImplementedParsed);

		const whoDevelopParsed = parseMetaObjectIntoKeyValue('who_develop', terms);
		setWhoDevelop(whoDevelopParsed);
	}, []);

	useEffect(() => {
		whoDevelop.forEach((element, index) => {
			form.setValue(`terms.who_develop[${index}]`, element.id);
		});
	}, [whoDevelop]);

	useEffect(() => {
		whereIsAlreadyImplemented.forEach((element, index) => {
			form.setValue(`terms.where_is_already_implemented[${index}]`, element.id);
		});
	}, [whereIsAlreadyImplemented]);

	// eslint-disable-next-line consistent-return
	const onDropAttachments = async (acceptedFiles, type) => {
		if (!acceptedFiles) return null;

		const formData = new FormData();
		for (let index = 0; index < acceptedFiles.length; index += 1) {
			formData.append(`files[${index}]`, acceptedFiles[index], acceptedFiles[index].name);
		}

		formData.append(
			'meta',
			JSON.stringify({
				object: 'technologies',
				object_id: form.getValues('id'),
			}),
		);

		const response = await upload(formData);
		if (type === 'img') {
			const newValue = [...previewedImgFiles, ...response];
			setPreviewedImgFiles(newValue);
		}

		if (type === 'pdf') {
			const newValue = [...previewedPdfFiles, ...response];
			setPreviewedPdfFiles(newValue);
		}
	};

	const deleteAttachment = async ({ index, element, type }) => {
		await deleteUpload(element.id);
		if (type === 'img') {
			setPreviewedImgFiles(
				previewedImgFiles.filter((media, innerIndex) => index !== innerIndex),
			);
		}
		if (type === 'pdf') {
			setPreviewedPdfFiles(
				previewedPdfFiles.filter((pdf, innerIndex) => index !== innerIndex),
			);
		}
	};

	// eslint-disable-next-line consistent-return
	const deleteFromCollection = (index, collection) => {
		if (collection === 'whoDevelop') {
			return setWhoDevelop(whoDevelop.filter((element, innerIndex) => index !== innerIndex));
		}

		if (collection === 'whereIsAlreadyImplemented') {
			return setWhereIsAlreadyImplemented(
				whereIsAlreadyImplemented.filter((element, innerIndex) => index !== innerIndex),
			);
		}
	};

	const onSelect = async (value, options, properties, term) => {
		const state =
			term === 'where_is_already_implemented' ? whereIsAlreadyImplemented : whoDevelop;
		const toBePushed = properties;
		if (state.some((element) => element.placeId === toBePushed.placeId)) {
			return;
		}
		const response = await geocodeByPlaceId(toBePushed.placeId);
		if (response) {
			toBePushed.location = {
				lat: response[0].geometry.location.lat(),
				lng: response[0].geometry.location.lng(),
			};
		}
		const createResponse = await createTerm(term, 'GOOGLE_PLACE', [
			{
				meta_key: 'placeId',
				meta_value: toBePushed.placeId,
			},
			{
				meta_key: 'description',
				meta_value: toBePushed.description,
			},
			{
				meta_key: 'latitude',
				meta_value: `${toBePushed.location.la}`,
			},
			{
				meta_key: 'longitude',
				meta_value: `${toBePushed.location.lng}`,
			},
		]);

		const newState = [...state, { ...toBePushed, id: createResponse.id }];
		if (term === 'where_is_already_implemented') {
			setWhereIsAlreadyImplemented(newState);
			setWhereIsAlreadyImplementedInput('');
		} else {
			setWhoDevelop(newState);
			setWhoDevelopInput('');
		}
	};

	return (
		<Wrapper>
			<Row>
				<Column>
					<Row>
						<Column>
							<Title>Onde a Tecnologia é desenvolvida?</Title>
						</Column>
					</Row>
					<Row>
						<Column>
							<PlacesAutocomplete
								id="who_develop"
								name="who_develop"
								value={whoDevelopInput}
								onChange={(value) => setWhoDevelopInput(value)}
								onSelect={(value, options, properties) =>
									onSelect(value, options, properties, 'who_develop')
								}
							>
								{({
									getInputProps,
									suggestions,
									getSuggestionItemProps,
									loading,
								}) => (
									<div>
										<InputField
											{...getInputProps({
												placeholder: 'Procurar localidades...',
												className: 'location-search-input',
											})}
											form={{ register: () => {} }}
										/>
										<div className="autocomplete-dropdown-container">
											{loading && (
												<GoogleAddressSugestions>
													Carregando...
												</GoogleAddressSugestions>
											)}
											<GoogleAddressSugestions>
												{suggestions.map((suggestion) => {
													const style = suggestion.active
														? {
																backgroundColor: '#fafafa',
														  }
														: {
																backgroundColor: '#fff',
														  };
													return (
														<div
															key={suggestion.placeId}
															{...getSuggestionItemProps(suggestion, {
																style,
															})}
														>
															<Suggestion>
																{suggestion.description}
															</Suggestion>
														</div>
													);
												})}
											</GoogleAddressSugestions>
										</div>
									</div>
								)}
							</PlacesAutocomplete>
						</Column>
					</Row>
					<Row>
						<Column>
							{whoDevelop.map((element, index) => {
								return (
									<IconRow row>
										<IconLink>
											<FaMapMarkerAlt size="2rem" /> {element.description}
										</IconLink>
										<CircularButton
											variant="remove"
											height="2"
											width="2"
											onClick={() =>
												deleteFromCollection(index, 'whoDevelop')
											}
										>
											<FaTrash size="1em" />
										</CircularButton>
										<InputHiddenField
											form={form}
											type="hidden"
											ref={form.register()}
											name={`terms.who_develop[${index}]`}
										/>
									</IconRow>
								);
							})}
						</Column>
					</Row>
					<Row>
						<Column>
							<Title>Onde a Tecnologia pode ser aplicada?</Title>
						</Column>
					</Row>
					<Row>
						<Column>
							<SelectField
								form={form}
								id="where_can_be_applied"
								label="Região"
								name="terms.where_can_be_applied"
								placeholder="Escolha uma região"
								validation={{ required: true }}
								options={[
									{
										value: 'semiarido',
										label: 'Semiárido',
									},
								]}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<Title>Onde a Tecnologia já está implantada?</Title>
						</Column>
					</Row>
					<Row>
						<Column>
							<PlacesAutocomplete
								id="where_is_already_implemented"
								name="where_is_already_implemented"
								value={whereIsAlreadyImplementedInput}
								onChange={(value) => setWhereIsAlreadyImplementedInput(value)}
								onSelect={(value, options, properties) =>
									onSelect(
										value,
										options,
										properties,
										'where_is_already_implemented',
									)
								}
							>
								{({
									getInputProps,
									suggestions,
									getSuggestionItemProps,
									loading,
								}) => (
									<div>
										<InputField
											{...getInputProps({
												placeholder: 'Procurar localidades...',
												className: 'location-search-input',
											})}
											form={{ register: () => {} }}
										/>
										<div className="autocomplete-dropdown-container">
											{loading && (
												<GoogleAddressSugestions>
													Carregando...
												</GoogleAddressSugestions>
											)}
											<GoogleAddressSugestions>
												{suggestions.map((suggestion) => {
													const style = suggestion.active
														? {
																backgroundColor: '#fafafa',
														  }
														: {
																backgroundColor: '#fff',
														  };
													return (
														<div
															{...getSuggestionItemProps(suggestion, {
																style,
															})}
															key={suggestion.placeId}
														>
															<Suggestion>
																{suggestion.description}
															</Suggestion>
														</div>
													);
												})}
											</GoogleAddressSugestions>
										</div>
									</div>
								)}
							</PlacesAutocomplete>
						</Column>
					</Row>
					<Row>
						<Column>
							{whereIsAlreadyImplemented.map((element, index) => {
								return (
									<IconRow row>
										<IconLink>
											<FaMapMarkerAlt size="2rem" /> {element.description}
										</IconLink>
										<CircularButton
											variant="remove"
											height="2"
											width="2"
											onClick={() =>
												deleteFromCollection(
													index,
													'whereIsAlreadyImplemented',
												)
											}
										>
											<FaTrash size="1em" />
										</CircularButton>
										<InputHiddenField
											form={form}
											type="hidden"
											ref={form.register()}
											name={`terms.where_is_already_implemented[${index}]`}
										/>
									</IconRow>
								);
							})}
						</Column>
					</Row>
				</Column>
				<Column>
					<Title>Fotos e Vídeos da tecnologia</Title>

					<Dropzone
						accept="image/*"
						onDrop={(acceptedFiles) => onDropAttachments(acceptedFiles, 'img')}
						ref={imgsRef}
					>
						{({ getRootProps, getInputProps }) => (
							<UploadBox {...getRootProps()}>
								<input {...getInputProps()} />
								<SvgBox>
									<IconBox>
										<FaFileUpload size="5rem" />
										<IconTextBox>
											<Div>Upload</Div>
											<Div>1280px x 720px</Div>
										</IconTextBox>
									</IconBox>
								</SvgBox>
							</UploadBox>
						)}
					</Dropzone>
					<UploadedImages>
						{previewedImgFiles?.map((element, index) => {
							return (
								<IconRow key={element.url}>
									<Media key={element.url} src={element.url} />
									<CircularButton
										variant="remove"
										height="3"
										width="3"
										onClick={() =>
											deleteAttachment({
												index,
												element,
												type: 'img',
											})
										}
									>
										<FaTrash size="1.5em" />
									</CircularButton>
								</IconRow>
							);
						})}
					</UploadedImages>

					<Title>Documentos</Title>
					<Dropzone
						accept=".pdf"
						onDrop={(acceptedFiles) => onDropAttachments(acceptedFiles, 'pdf')}
						ref={pdfRef}
					>
						{({ getRootProps, getInputProps }) => (
							<UploadBox {...getRootProps()}>
								<input {...getInputProps()} />
								<SvgBox>
									<IconBox>
										<FaFileUpload size="5rem" />
										<IconTextBox>
											<Div>Upload</Div>
											<Div>.PDF</Div>
										</IconTextBox>
									</IconBox>
								</SvgBox>
							</UploadBox>
						)}
					</Dropzone>
					<UploadedDocuments>
						{previewedPdfFiles?.map((element, index) => {
							return (
								<IconRow row>
									<IconLink href={element.url}>
										<FaFilePdf size="2rem" /> {element.filename}
									</IconLink>
									<CircularButton
										variant="remove"
										height="2"
										width="2"
										onClick={() =>
											deleteAttachment({
												index,
												element,
												type: 'pdf',
											})
										}
									>
										<FaTrash size="1em" />
									</CircularButton>
								</IconRow>
							);
						})}
					</UploadedDocuments>
				</Column>
			</Row>
		</Wrapper>
	);
};

MapAndAttachments.propTypes = {
	form: PropTypes.shape({
		getValues: PropTypes.func,
		register: PropTypes.func,
		setValue: PropTypes.func,
	}),
	data: PropTypes.shape({
		technology: PropTypes.shape({
			attachments: PropTypes.arrayOf(PropTypes.shape({})),
			rawTerms: PropTypes.arrayOf(PropTypes.shape({})),
		}),
	}),
};

MapAndAttachments.defaultProps = {
	form: {},
	data: {
		technology: {
			attachments: [],
			rawTerms: [],
		},
	},
};

export default MapAndAttachments;
