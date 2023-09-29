import TypesService from '@/services/TypesService';
import {
	OAuthProviderParams,
	OAuthProviderTypes,
	PhoneAuthSMSProviderParams,
	PhoneAuthSMSProviders,
} from '@/types';
import { APIError, FieldType, Types } from '@/types/type';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
interface TypesStore {
	orgRoles: string[];
	appRoles: string[];
	bvlTypes: string[];
	fieldTypes: FieldType[];
	databaseTypes: string[];
	instanceTypes: {
		engine: string[];
		database: string[];
		cache: string[];
		storage: string[];
		queue: string[];
		scheduler: string[];
		realtime: string[];
	};
	phoneAuthSMSProviders: {
		provider: PhoneAuthSMSProviders;
		params: {
			name: PhoneAuthSMSProviderParams;
			title: string;
			type: string;
			description: string;
			multiline: boolean;
		}[];
	}[];
	oAuthProviderTypes: {
		provider: OAuthProviderTypes;
		params: {
			name: OAuthProviderParams;
			title: string;
			type: string;
			multiline: boolean;
		}[];
	}[];
	authUserDataModel: {
		name: string;
		type: string;
	}[];
	isTypesOk: boolean;
	getAllTypes: () => Promise<Types | APIError>;
}

const useTypeStore = create<TypesStore>()(
	devtools(
		persist(
			(set) => ({
				orgRoles: [],
				appRoles: [],
				bvlTypes: [],
				fieldTypes: [],
				databaseTypes: [],
				instanceTypes: {
					engine: [],
					database: [],
					cache: [],
					storage: [],
					queue: [],
					scheduler: [],
					realtime: [],
				},
				phoneAuthSMSProviders: [
					{
						provider: PhoneAuthSMSProviders.TWILIO,
						params: [
							{
								name: 'accountSID',
								title: '',
								type: '',
								description: '',
								multiline: false,
							},
						],
					},
				],
				oAuthProviderTypes: [
					{
						provider: OAuthProviderTypes.Google,
						params: [
							{
								name: 'key',
								title: '',
								type: '',
								multiline: true,
							},
						],
					},
				],
				authUserDataModel: [
					{
						name: '',
						type: '',
					},
				],
				isTypesOk: false,
				getAllTypes: async () => {
					try {
						const res = await TypesService.getAllTypes();
						set({
							...res,
							isTypesOk: true,
						});
						return res;
					} catch (error) {
						throw error as APIError;
					}
				},
			}),
			{
				name: 'type-storage',
			},
		),
	),
);
export default useTypeStore;
