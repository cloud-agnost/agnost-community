import { useDebounceFn, useEditor } from '@/hooks';
import { EDITOR_OPTIONS } from '@/hooks/useEditor';
import useThemeStore from '@/store/theme/themeStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Tab } from '@/types';
import { addLibsToEditor, cn, filterMatchingKeys, getTabIdFromUrl, isEmpty } from '@/utils';
import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import _ from 'lodash';
import { useEffect } from 'react';

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
}: CodeEditorProps) {
	const { updateCurrentTab, getTabById } = useTabStore();
	const { version, packages, typings, getTypings } = useVersionStore();
	const theme = useThemeStore((state) => state.theme);
	const typeWorker: Worker = new Worker(
		new URL('../../workers/fetchTypings.worker.ts', import.meta.url),
		{
			type: 'module',
		},
	);

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
		onSave,
		packages,
	});

	function setupLibs() {
		const installedPackages =
			globalThis.monaco?.languages.typescript.javascriptDefaults.getExtraLibs() ?? {};

		const intersection = filterMatchingKeys(installedPackages, packages);

		if (!_.isEmpty(intersection)) {
			typeWorker.postMessage(intersection);
			typeWorker.onmessage = function (e) {
				addLibsToEditor({
					...e.data,
					...typings,
				});
			};
		}
	}

	useEffect(() => {
		if (!isEmpty(globalThis.monaco) && defaultLanguage === 'javascript') {
			setupLibs();
		}
	}, [globalThis.monaco, packages]);

	return (
		<div className={cn(containerClassName)}>
			<MonacoEditor
				theme={theme === 'dark' ? 'nightOwl' : 'vs-light'}
				beforeMount={onBeforeMount}
				className={cn('editor', className)}
				onChange={onCodeEditorChange}
				defaultValue={value}
				value={value}
				onMount={onCodeEditorMount}
				defaultLanguage={defaultLanguage}
				language={defaultLanguage}
				path={`file:///src/${name}.js`}
				options={{
					value,
					readOnly: readonly,
					...EDITOR_OPTIONS,
				}}
			/>
		</div>
	);
}
