import * as vscode from 'vscode';
import { promptBoost } from './promptBoost';


export function activate(context: vscode.ExtensionContext) {

    const regex = /Visual Studio Code/;
    if (!regex.test(vscode.env.appName)) {
        vscode.window.showErrorMessage("This extension can only be used with Visual Studio Code. Using it in any other product could cause unexpected behavior, performance, or security issues.", { modal: true });
        return;
    }

    registerAgentTools(context);

    const command = vscode.commands.registerTextEditorCommand(
        'promptBoost.boost',
        async (textEditor: vscode.TextEditor) => {
            // Only process .prompt.md files
            if (!textEditor.document.fileName.endsWith('.prompt.md')) {
                vscode.window.showErrorMessage('This command only works on .prompt.md files');
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Boosting prompt... ",
                cancellable: false
            }, async () => {
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
            });
        }
    );

    context.subscriptions.push(command);
}


export function registerAgentTools(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.lm.registerTool('promptBoost', new promptBoostTool()));
}

interface IPromptBoostParameters {
    promptText: string;
}

export class promptBoostTool implements vscode.LanguageModelTool<IPromptBoostParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IPromptBoostParameters>,
        _token: vscode.CancellationToken
    ) {
        const params = options.input as IPromptBoostParameters;
        const result = await promptBoost(params.promptText);
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(result)]);
    }

    async prepareInvocation(
        _options: vscode.LanguageModelToolInvocationPrepareOptions<IPromptBoostParameters>,
        _token: vscode.CancellationToken
    ) {
        return {
            invocationMessage: `Boosting your prompt...`
        };
    }
}

export function deactivate() { }
