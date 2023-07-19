import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
	forms,
	general,
	login,
	organization,
	profileSettings,
	application,
	version,
	onboarding,
	database,
	resources as rs,
	endpoint,
} from './en';

export const resources = {
	en: {
		translation: {
			login,
			database,
			forms,
			general,
			organization,
			profileSettings,
			application,
			onboarding,
			version,
			resources: rs,
			endpoint,
		},
	},
};

i18next
	.use(initReactI18next)
	.init({
		lng: 'en', // if you're using a language detector, do not define the lng option
		debug: true,
		resources,
		defaultNS: 'translation',
	})
	.catch(console.error);

export const { t } = i18next;

export default i18next;
