import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
	application,
	database,
	endpoint,
	forms,
	general,
	login,
	onboarding,
	organization,
	profileSettings,
	queue,
	resources as rs,
	task,
	storage,
	version,
} from './en';

export const resources = {
	en: {
		translation: {
			login,
			database,
			queue,
			forms,
			general,
			organization,
			profileSettings,
			application,
			onboarding,
			version,
			resources: rs,
			endpoint,
			task,
			storage,
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
