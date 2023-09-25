import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
	application,
	cache,
	database,
	endpoint,
	forms,
	func,
	general,
	login,
	onboarding,
	organization,
	profileSettings,
	queue,
	resources as rs,
	storage,
	task,
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
			cache,
			function: func,
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
