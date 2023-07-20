import { ReactNode } from 'react';
import { Layout } from '@/layouts/Layout';
import { Tabs } from '@/features/version/Tabs';
import './versionLayout.scss';
import { cn } from '@/utils';

interface VersionLayoutProps {
	children: ReactNode;
	className?: string;
}
export default function VersionLayout({ children, className }: VersionLayoutProps) {
	return (
		<Layout>
			<Tabs />
			<div className={cn('version-layout', className)}>{children}</div>
		</Layout>
	);
}
