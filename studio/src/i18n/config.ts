import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { login, forms, general, organization } from './en';

export const resources = {
	en: {
		translation: {
			login,
			forms,
			general,
			organization,
		},
	},
};

i18next.use(initReactI18next).init({
	lng: 'en', // if you're using a language detector, do not define the lng option
	debug: true,
	resources,
	defaultNS: 'translation',
});
