import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Description } from "@/components/Description";
import { Root } from "@/pages/root";
import {
	AccountInformation,
	CreateApp,
	CreateOrganization,
	InviteTeamMembers,
	Onboarding,
	SMTPConfiguration,
} from "@/pages/onboarding";
import { Organization, SelectOrganization } from "@/pages/organization";

const router = createBrowserRouter([
	{
		path: "/",
		loader: Root.loader,
		element: <Root />,
		children: [
			{
				path: "/login",
				element: (
					<AuthLayout>
						<Description title="Login to your account">
							Welcome back! Please enter your details.
						</Description>
					</AuthLayout>
				),
			},
			{
				path: "/organization",
				element: <Organization />,
				children: [
					{
						path: "",
						element: <SelectOrganization />,
					},
				],
			},
			{
				path: "/organization/:id",
			},
		],
	},
	{
		loader: Onboarding.loader,
		path: "/onboarding",
		element: <Onboarding />,
		children: [
			{
				path: "",
				element: <AccountInformation />,
			},
			{
				path: "create-organization",
				element: <CreateOrganization />,
			},
			{
				path: "create-app",
				element: <CreateApp />,
			},
			{
				path: "smtp-configuration",
				element: <SMTPConfiguration />,
			},
			{
				path: "invite-team-members",
				element: <InviteTeamMembers />,
			},
		],
	},
]);

export default router;
