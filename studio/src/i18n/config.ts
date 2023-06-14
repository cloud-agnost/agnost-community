import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enLogin from './en/login.json';

export const resources = {
	en: {
		translation: {
			login: enLogin,
		},
	},
};

i18next.use(initReactI18next).init({
	lng: 'en', // if you're using a language detector, do not define the lng option
	debug: true,
	resources,
	defaultNS: 'translation',
});
