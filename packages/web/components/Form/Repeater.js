/* eslint-disable no-use-before-define */
import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import styled from 'styled-components';
import Help from './Help';
import { Row } from './styles';

const Wrapper = styled.div`
	margin-bottom: 3rem;

	${({ withBorder }) =>
		withBorder
			? `padding-bottom: 5rem;
	padding-right: 3rem;
	padding-left: 3rem;
	border: 1px solid hsl(0,0%,74%);`
			: null}
`;

const RepeaterBody = styled.div`
	margin-top: 2rem;
`;

const TitleHelpWrapper = styled.div`
	display: flex;
	align-items: center;
`;

const Repeater = ({
	childsComponent,
	endComponent,
	name,
	emptyValue,
	form,
	title,
	help,
	noInitialRow,
	withBorder,
}) => {
	const { control } = form;

	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});

	useEffect(() => {
		if (!fields.length && !noInitialRow) {
			append(emptyValue);
		}
	}, [fields, noInitialRow, append, emptyValue]);

	return (
		<Wrapper withBorder={withBorder}>
			<Row>
				<TitleHelpWrapper>
					{title ? <h3>{title}</h3> : null}
					{help && <Help id={name} HelpComponent={help} />}
				</TitleHelpWrapper>
			</Row>
			<RepeaterBody>
				{fields.map((item, index) => (
					<Fragment key={item.id}>
						{childsComponent({
							item,
							control,
							fields,
							append,
							remove,
							index,
						})}
					</Fragment>
				))}
			</RepeaterBody>
			{endComponent ? endComponent({ append, emptyValue }) : null}
		</Wrapper>
	);
};

Repeater.propTypes = {
	emptyValue: PropTypes.shape({}).isRequired,
	title: PropTypes.string,
	name: PropTypes.string.isRequired,
	childsComponent: PropTypes.func.isRequired,
	endComponent: PropTypes.func,
	help: PropTypes.node,
	form: PropTypes.shape({
		control: PropTypes.shape({}).isRequired,
	}).isRequired,
	noInitialRow: PropTypes.bool,
	withBorder: PropTypes.bool,
};

Repeater.defaultProps = {
	endComponent: null,
	title: null,
	help: null,
	noInitialRow: false,
	withBorder: false,
};

export default Repeater;
