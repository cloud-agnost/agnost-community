import Editor, { EditorProps, Monaco } from '@monaco-editor/react';
import nightOwl from 'monaco-themes/themes/Night Owl.json';
import { useRef } from 'react';
import { cn } from '@/utils';

interface CodeEditorProps extends Omit<EditorProps, 'onMount' | 'defaultLanguage'> {
	containerClassName?: string;
}
export default function CodeEditor({
	containerClassName,
	defaultValue,
	value,
	onChange,
	onValidate,
	loading,
}: CodeEditorProps) {
	const editorRef = useRef(null);

	function handleEditorDidMount(editor: any, monaco: Monaco) {
		editorRef.current = editor;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		monaco.editor.defineTheme('nightOwl', nightOwl);
		monaco.editor.setTheme('nightOwl');
	}

	return (
		<div className={cn(containerClassName)}>
			<Editor
				className={cn('editor')}
				onChange={onChange}
				onValidate={onValidate}
				defaultValue={defaultValue}
				value={value}
				loading={loading}
				onMount={handleEditorDidMount}
				defaultLanguage='javascript'
			/>
		</div>
	);
}
