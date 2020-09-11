module.exports = {
	useTranslation: jest.fn(() => {
		return {
			t(slug) {
				return slug;
			},
			i18n: {
				language: 'pt',
			},
		};
	}),
	withTranslation: () => (Component) => {
		// eslint-disable-next-line no-param-reassign
		Component.defaultProps = { ...Component.defaultProps, t: () => '' };
		return Component;
	},
};
