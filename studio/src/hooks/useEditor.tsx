import { formatCode } from '@/utils';
import { BeforeMount, EditorProps } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import nightOwl from 'monaco-themes/themes/Night Owl.json';
import slush from 'monaco-themes/themes/Slush and Poppies.json';
import iPlastic from 'monaco-themes/themes/iPlastic.json';
import { useRef } from 'react';

export const EDITOR_OPTIONS: EditorProps['options'] = {
	minimap: { enabled: false },
	fontSize: 14,
	quickSuggestions: {
		strings: true,
		other: true,
		comments: true,
	},
	guides: {
		indentation: false,
		highlightActiveIndentation: true,
	},
	fontLigatures: true,
	fontFamily: "'Fira Code', 'Fira Mono', 'Menlo', 'Monaco', 'Courier', monospace",
	fontWeight: '400',
	autoClosingBrackets: 'always',
	autoDetectHighContrast: true,
	wordWrap: 'on',
	lineNumbers: 'on',
	lineNumbersMinChars: 3,
	scrollBeyondLastLine: false,
	scrollbar: {},
	renderLineHighlight: 'none', //Enable rendering of current line highlight
	folding: false, //Enable code folding
	codeLens: true,
	tabSize: 2,
};

export type CodeEditorProps = {
	onChange?: (ev: monaco.editor.IModelContentChangedEvent) => void;
	onSave?: (logic: string) => void;
};

export default function useEditor({ onChange, onSave }: CodeEditorProps) {
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

	async function saveEditorContent(language: string | undefined, cb?: (value: string) => void) {
		const ed = editorRef.current;
		const val = ed?.getValue() as string;

		if (language === 'json') {
			ed?.trigger('', 'editor.action.formatDocument', null);
		}
		if (language === 'javascript') {
			const formatted = await formatCode(val);
			const fullRange = ed?.getModel()?.getFullModelRange();
			ed?.executeEdits(null, [
				{
					text: formatted,
					range: fullRange as monaco.Range,
				},
			]);

			ed?.pushUndoStop();
			cb?.(formatted);
		}
	}
	function configureEditor(editor: monaco.editor.IStandaloneCodeEditor, monaco: any) {
		editor.onDidFocusEditorText(() => {
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				editor.trigger('editor', 'editor.action.formatDocument', undefined);
				saveEditorContent(editor.getModel()?.getLanguageId(), onSave);
			});
		});

		monaco.languages.registerDocumentFormattingEditProvider('typescript', {
			async provideDocumentFormattingEdits(model: any) {
				return [
					{
						range: model.getFullModelRange(),
						text: await formatCode(model.getValue()),
					},
				];
			},
		});
	}

	const onBeforeMount: BeforeMount = (monaco) => {
		monaco.editor.defineTheme('nightOwl', nightOwl as monaco.editor.IStandaloneThemeData);
		monaco.editor.defineTheme('slush', slush as monaco.editor.IStandaloneThemeData);
		monaco.editor.defineTheme('iPlastic', iPlastic as monaco.editor.IStandaloneThemeData);
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.Latest,
			allowNonTsExtensions: true,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			module: monaco.languages.typescript.ModuleKind.CommonJS,
			noEmit: true,
			esModuleInterop: true,
			allowJs: true,
			checkJs: true,
			strict: true,
			typeRoots: ['node_modules/@types'],
		});
	};

	function onCodeEditorMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: any) {
		editorRef.current = editor;
		globalThis.editor = editor;
		configureEditor(editor, monaco);
	}

	const onCodeEditorChange = (
		_value: string | undefined,
		ev: monaco.editor.IModelContentChangedEvent,
	) => {
		onChange?.(ev);
	};
	return {
		onBeforeMount,
		onCodeEditorMount,
		onCodeEditorChange,
		editor: editorRef.current,
	};
}
