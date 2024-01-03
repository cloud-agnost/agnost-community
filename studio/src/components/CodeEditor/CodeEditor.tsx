import { useDebounceFn, useEditor } from '@/hooks';
import { EDITOR_OPTIONS } from '@/hooks/useEditor';
import useAuthStore from '@/store/auth/authStore';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { Tab } from '@/types';
import { addLibsToEditor, cn, getTabIdFromUrl, isEmpty } from '@/utils';
import Loadable from '@loadable/component';
import { EditorProps } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';

const MonacoEditor = Loadable(() => import('@monaco-editor/react'));

interface CodeEditorProps extends Omit<EditorProps, 'defaultLanguage'> {
	containerClassName?: string;
	defaultLanguage?: 'javascript' | 'json' | 'html';
	readonly?: boolean;
	onSave?: (logic: string) => void;
	name: string;
}
export default function CodeEditor({
	containerClassName,
	value,
	className,
	readonly,
	defaultLanguage = 'javascript',
	name,
	onChange,
	onSave,
	options,
}: CodeEditorProps) {
	const { updateCurrentTab, getTabById } = useTabStore();
	const { version } = useVersionStore();
	const { typings } = useUtilsStore();
	const [showLoader, setShowLoader] = useState(false);
	const user = useAuthStore((state) => state.user);
	const setTabState = useDebounceFn((isDirty) => {
		const tabId = getTabIdFromUrl();
		const tab = getTabById(version?._id, tabId as string) as Tab;
		if (tab?.type.toLowerCase() === tab?.path) return;
		updateCurrentTab(version?._id, {
			...tab,
			isDirty,
		});
	}, 500);

	function handleOnChange(value: string | undefined, ev: any) {
		if (defaultLanguage === 'javascript' && !readonly) {
			setTabState(value !== ev.changes[0].text);
		}
		onChange?.(value, ev);
	}
	const { onBeforeMount, onCodeEditorMount, onCodeEditorChange } = useEditor({
		onChange: handleOnChange,
		onSave: handleSaveLogic,
	});

	function handleSaveLogic(value: string) {
		onSave?.(value);
	}

	useEffect(() => {
		if (!isEmpty(globalThis.monaco) && defaultLanguage === 'javascript') {
			addLibsToEditor(typings ?? {});
		}
	}, [globalThis.monaco, typings]);

	useEffect(() => {
		let timer = setTimeout(() => {
			setShowLoader(true);
		}, 100);

		// Simulate a loading process
		const simulateLoading = async () => {
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a 2 seconds loading process
			clearTimeout(timer);
			setShowLoader(false);
		};

		simulateLoading();

		return () => {
			clearTimeout(timer);
		};
	}, []);

	return (
		<div className={cn(containerClassName)}>
			<MonacoEditor
				theme={user?.editorSettings?.theme ?? 'night-owl'}
				beforeMount={onBeforeMount}
				className={cn('editor', className)}
				onChange={onCodeEditorChange}
				defaultValue={value}
				value={value}
				onMount={onCodeEditorMount}
				defaultLanguage={defaultLanguage}
				language={defaultLanguage}
				path={`file:///src/${name}.js`}
				loading={showLoader && <BeatLoader color='#6884FD' size={24} margin={18} />}
				options={{
					value,
					readOnly: readonly,
					...EDITOR_OPTIONS,
					formatOnPaste: defaultLanguage !== 'javascript',
					formatOnType: defaultLanguage !== 'javascript',
					...user?.editorSettings,
					...options,
				}}
			/>
		</div>
	);
}
