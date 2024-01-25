import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	if (vscode.window.activeTextEditor) {
		triggerUpdateDecorations(vscode.window.activeTextEditor);
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			triggerUpdateDecorations(editor);
		}
	}, null, context.subscriptions);

	vscode.window.onDidChangeTextEditorSelection(event => {
		if (vscode.window.activeTextEditor) {
			triggerUpdateDecorations(vscode.window.activeTextEditor);
		}
	}, null, context.subscriptions);

	vscode.window.onDidChangeTextEditorVisibleRanges(event => {
		triggerUpdateDecorations(event.textEditor);
	}, null, context.subscriptions);
}

const nilDecorationType = vscode.window.createTextEditorDecorationType({
	textDecoration: 'none; display: none;', // Hides the original 'nil'
	after: {
		contentText: 'null', // Display 'null' instead
		color: 'inherit', // Inherits the color of the text
		backgroundColor: 'inherit', // Inherits the background color
		fontStyle: 'inherit', // Inherits the font style
		fontWeight: 'inherit', // Inherits the font weight
		textDecoration: 'none' // No additional decoration
	},
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

function triggerUpdateDecorations(editor: vscode.TextEditor) {
	const regEx = /\bnil\b/g;
	const nilRanges: vscode.DecorationOptions[] = [];
	const text = editor.document.getText();

	let match;
	while (match = regEx.exec(text)) {
		const startPos = editor.document.positionAt(match.index);
		const endPos = editor.document.positionAt(match.index + match[0].length);
		const decoration = { range: new vscode.Range(startPos, endPos) };
		nilRanges.push(decoration);
	}

	// Check if the cursor is within any 'nil' range
	const cursorPosition = editor.selection.start;
	for (const range of nilRanges) {
		if (range.range.contains(cursorPosition)) {
			// Remove the decoration to show 'nil' again
			editor.setDecorations(nilDecorationType, []);
			return;
		}
	}

	// If the cursor is not within a 'nil' range, show 'null'
	editor.setDecorations(nilDecorationType, nilRanges);
}

export function deactivate() { }
