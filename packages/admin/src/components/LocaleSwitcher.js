import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useLocale, useSetLocale, withTranslate } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	ToggleButtonGroup: {
		backgroundColor: 'white',
	},
});

const LocaleSwitcher = () => {
	const locale = useLocale();
	const setLocale = useSetLocale();
	const classes = useStyles();
	localStorage.setItem('locale', locale);
	const handleOnChange = async (event, value) => {
		await setLocale(value || 'en');
		await localStorage.setItem('locale', locale);
	};
	return (
		<div>
			<ToggleButtonGroup
				className={classes.ToggleButtonGroup}
				size="small"
				value={locale}
				exclusive
				onChange={handleOnChange}
			>
				<ToggleButton value="pt-br">PT</ToggleButton>
				<ToggleButton value="en">EN</ToggleButton>
			</ToggleButtonGroup>
		</div>
	);
};

export default withTranslate(LocaleSwitcher);
