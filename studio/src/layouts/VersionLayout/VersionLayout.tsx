import { Tabs } from '@/features/version/Tabs';
import { cn, joinChannel, leaveChannel } from '@/utils';
import { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './versionLayout.scss';

interface VersionLayoutProps {
	children: ReactNode;
	className?: string;
}
export default function VersionLayout({ children, className }: VersionLayoutProps) {
	const { versionId } = useParams<{ versionId: string }>();

	useEffect(() => {
		if (versionId) {
			joinChannel(versionId);
		}
		return () => {
			leaveChannel(versionId as string);
		};
	}, [versionId]);
	return (
		<>
			<Tabs />
			<div className={cn('version-layout', className)} id='version-layout'>
				{children}
			</div>
		</>
	);
}
