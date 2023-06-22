import { ReactNode } from 'react';
import { Layout } from '@/layouts/Layout';
import { Tabs } from '@/features/version/components/Tabs';
import './versionLayout.scss';

interface VersionLayoutProps {
	children: ReactNode;
}
export default function VersionLayout({ children }: VersionLayoutProps) {
	return (
		<Layout>
			<Tabs />
			<div className='version-layout'>{children}</div>
		</Layout>
	);
}
