import { cn } from '@/utils';
import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import the Monaco API
import nightOwl from 'monaco-themes/themes/Night Owl.json';

interface CodeEditorProps extends Omit<EditorProps, 'onMount' | 'defaultLanguage'> {
	containerClassName?: string;
	defaultLanguage?: string;
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
}: CodeEditorProps) {
	const handleEditorDidMount = (
		editor: monaco.editor.IStandaloneCodeEditor,
		_monaco: typeof monaco,
	) => {
		editor.addAction({
			id: 'save-action',
			label: 'Save',
			keybindings: [_monaco.KeyMod.CtrlCmd | _monaco.KeyCode.KeyS],
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run: (ed) => {
				onSave?.(ed.getValue());
			},
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		_monaco.editor.defineTheme('nightOwl', nightOwl);
		_monaco.editor.setTheme('nightOwl');
	};
	return (
		<div className={cn(containerClassName)}>
			<MonacoEditor
				theme='vs-dark'
				className={cn('editor', className)}
				onChange={onChange}
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
					theme: 'nightOwl',
					autoClosingBrackets: 'always',
					autoDetectHighContrast: true,
					fontLigatures: true,
					fontSize: 16,
				}}
			/>
		</div>
	);
}
