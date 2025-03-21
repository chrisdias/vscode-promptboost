import * as vscode from 'vscode';
import { registerAgentTools } from './tools';
import { promptBoost} from './promptBoost';


export function activate(context: vscode.ExtensionContext) {
    registerAgentTools(context);

    const command = vscode.commands.registerTextEditorCommand(
        'promptBoost.boost',
        async (textEditor: vscode.TextEditor) => {
            // Only process .prompt.md files
            if (!textEditor.document.fileName.endsWith('.prompt.md')) {
                vscode.window.showErrorMessage('This command only works on .prompt.md files');
                return;
            }

            // Get selected text or full document
            const selection = textEditor.selection;
            const promptText = selection.isEmpty
                ? textEditor.document.getText()
                : textEditor.document.getText(selection);

            const enhancedPrompt = await promptBoost(promptText);

            // Replace either the selection or the whole document
            await textEditor.edit(edit => {
                if (selection.isEmpty) {
                    const start = new vscode.Position(0, 0);
                    const end = new vscode.Position(
                        textEditor.document.lineCount - 1,
                        textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length
                    );
                    edit.replace(new vscode.Range(start, end), enhancedPrompt);
                } else {
                    edit.replace(selection, enhancedPrompt);
                }
            });

        }
    );

    context.subscriptions.push(command);
}

export function deactivate() { }
