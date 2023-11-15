import { Header } from '@/components/Header';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<main className='main overflow-hidden'>{children}</main>
		</>
	);
}