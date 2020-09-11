/* eslint-disable import/no-extraneous-dependencies */
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import ptBrMessages from 'ra-language-pt-br';

const i18nProvider = polyglotI18nProvider(
	(locale) => (locale === 'pt-br' ? ptBrMessages : englishMessages),
	'en', // Default locale
);

export default i18nProvider;
