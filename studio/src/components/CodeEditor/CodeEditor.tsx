import { useDebounceFn } from '@/hooks';
import useThemeStore from '@/store/theme/themeStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Tab } from '@/types';
import { cn, saveEditorContent } from '@/utils';
import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import the Monaco API
import github from 'monaco-themes/themes/Github.json';
import nightOwl from 'monaco-themes/themes/Night Owl.json';
import { useRef } from 'react';
interface CodeEditorProps extends Omit<EditorProps, 'defaultLanguage'> {
	containerClassName?: string;
	defaultLanguage?: 'javascript' | 'json';
	readonly?: boolean;
	onSave?: (logic: string) => void;
}
export default function CodeEditor({
	containerClassName,
	defaultValue,
	value,
	onChange,
	onValidate,
	loading,
	className,
	onSave,
	readonly,
	defaultLanguage = 'javascript',
	onMount,
}: CodeEditorProps) {
	const { updateCurrentTab, getTabById } = useTabStore();
	const { theme } = useThemeStore();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
	const { version } = useVersionStore();
	const setTabState = useDebounceFn((isDirty) => {
		const searchParams = new URLSearchParams(window.location.search);
		const tabId = searchParams.get('tabId');
		const tab = getTabById(version?._id as string, tabId as string) as Tab;
		if (tab?.type.toLowerCase() === tab?.path) return;
		updateCurrentTab(version?._id as string, {
			...tab,
			isDirty,
		});
	}, 500);
	function handleEditorChange(
		value: string | undefined,
		ev: monaco.editor.IModelContentChangedEvent,
	) {
		onChange?.(value, ev);
		if (defaultLanguage === 'javascript' && !readonly) {
			setTabState(value !== ev.changes[0].text);
		}
	}
	const handleEditorDidMount = (
		editor: monaco.editor.IStandaloneCodeEditor,
		_monaco: typeof monaco,
	) => {
		editorRef.current = editor;
		onMount?.(editor, _monaco);
		editor.addAction({
			id: 'save-action',
			label: 'Save',
			keybindings: [_monaco.KeyMod.CtrlCmd | _monaco.KeyCode.KeyS],
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run: async () => {
				saveEditorContent(editor, defaultLanguage, onSave);
			},
		});
	};
	function setEditorTheme(monaco: any) {
		monaco.editor.defineTheme('nightOwl', nightOwl);
		monaco.editor.defineTheme('github', github);
	}

	return (
		<div className={cn(containerClassName)}>
			<MonacoEditor
				theme={theme === 'dark' ? 'nightOwl' : 'github'}
				beforeMount={setEditorTheme}
				className={cn('editor', className)}
				onChange={handleEditorChange}
				onValidate={onValidate}
				defaultValue={defaultValue}
				value={value}
				loading={loading}
				onMount={handleEditorDidMount}
				defaultLanguage={defaultLanguage}
				options={{
					readOnly: readonly,
					minimap: {
						enabled: false,
					},
					autoClosingBrackets: 'always',
					autoDetectHighContrast: true,
					fontLigatures: true,
					fontSize: 16,
					formatOnPaste: true,
					formatOnType: true,
				}}
			/>
		</div>
	);
}
