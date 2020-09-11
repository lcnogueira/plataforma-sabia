import * as React from 'react';
import { AppBar as AppBarRA } from 'react-admin';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import LocaleSwitcher from './LocaleSwitcher';

const useStyles = makeStyles({
	title: {
		flex: 1,
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
	},
	spacer: {
		flex: 1,
	},
	AppBarRA: {
		backgroundColor: 'rgb(249, 155, 67)',
	},
});

const AppBar = (props) => {
	const classes = useStyles();
	return (
		// eslint-disable-next-line react/jsx-props-no-spreading
		<AppBarRA {...props} className={classes.AppBarRA}>
			<Typography
				variant="h6"
				color="inherit"
				className={classes.title}
				id="react-admin-title"
			/>
			<p>Plataforma Sabiá</p>
			<span className={classes.spacer} />
			<LocaleSwitcher />
		</AppBarRA>
	);
};

export default AppBar;
