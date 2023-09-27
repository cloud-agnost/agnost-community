import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ThemeStore {
	theme: string;
	setTheme: (theme: string) => void;
}

const useThemeStore = create<ThemeStore>()(
	devtools(
		persist(
			(set, get) => ({
				theme: 'dark',
				setTheme: (theme) => {
					document.body.classList.remove(get().theme);
					document.body.classList.add(theme);
					set({ theme });
				},
			}),
			{
				name: 'theme-storage',
			},
		),
	),
);

export default useThemeStore;
