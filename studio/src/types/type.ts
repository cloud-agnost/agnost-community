import { z } from 'zod';

export const APIErrorSchema = z.object({
	error: z.string(),
	details: z.string(),
	code: z.string(),
});
export const UserSchema = z.object({
	iid: z.string(),
	name: z.string(),
	color: z.string(),
	contactEmail: z.string(),
	'2fa': z.boolean(),
	pictureUrl: z.string().nullish(),
	canCreateOrg: z.boolean(),
	isClusterOwner: z.boolean(),
	loginProfiles: z.array(
		z.object({
			provider: z.string(),
			id: z.string(),
			email: z.string(),
			emailVerified: z.boolean(),
			_id: z.string(),
		}),
	),
	notifications: z.array(z.string()),
	status: z.string(),
	_id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	__v: z.number(),
	at: z.string(),
	rt: z.string(),
});

export type APIError = z.infer<typeof APIErrorSchema>;
export type User = z.infer<typeof UserSchema>;

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
	appMembers: AppMembers[];
}

export interface SMTPSettings {
	host: string;
	port: string;
	useTLS: boolean;
	user: string;
	password: string;
}

export interface AppMembers {
	email?: string;
	role?: 'Admin' | 'Developer' | 'Viewer' | '';
}

export interface CompleteAccountSetupRequest {
	email: string | undefined;
	token: string;
	inviteType: 'org' | 'app';
	name: string;
	password: string;
}

export interface FinalizeAccountSetupRequest {
	email: string | undefined;
	verificationCode: number;
	password: string;
	name: string;
}
