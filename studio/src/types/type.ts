export interface APIError {
	error: string;
	details: string;
	code: string;
}

export interface User {
	iid: string;
	name: string;
	color: string;
	contactEmail: string;
	'2fa': boolean;
	canCreateOrg: boolean;
	isClusterOwner: boolean;
	loginProfiles: {
		provider: string;
		id: string;
		email: string;
		emailVerified: boolean;
		_id: string;
	}[];
	notifications: string[];
	status: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
	at: string;
	rt: string;
}

export interface UserDataToRegister {
	name: string;
	email: string;
	password: string;
}

export interface OnboardingData {
	orgName: string;
	appName: string;
	uiBaseURL: string;
	smtp: SMTPSettings;
	appMembers: {
		email: string;
		role: string;
	}[];
}

export interface SMTPSettings {
	host: string;
	port: number;
	useTLS: boolean;
	user: string;
	password: string;
}
