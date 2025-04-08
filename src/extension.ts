import * as vscode from 'vscode';
import { promptBoost } from './promptBoost';


// Get custom instruction files from settings
function getCustomInstructionFiles(): string[] {
    const config = vscode.workspace.getConfiguration('github.copilot.chat');
    const settingKeys = [
        'reviewSelection.instructions',
        'codeGeneration.instructions',
        'commitMessageGeneration.instructions',
        'pullRequestDescriptionGeneration.instructions',
        'testGeneration.instructions'
    ];

    const files: string[] = [];
    for (const key of settingKeys) {
        const instructions = config.get<Array<{ file: string }>>(key);
        if (instructions && Array.isArray(instructions)) {
            instructions.forEach(instruction => {
                if (instruction.file) {
                    files.push(instruction.file);
                }
            });
        }
    }
    return files;
}

// Add this function to check file eligibility
function isEligibleFile(fileName: string): boolean {
    // Get custom instruction files
    const customFiles = getCustomInstructionFiles();

    // Check if the file matches any of our criteria
    return fileName.endsWith('.prompt.md') ||
        fileName.includes('custom-instructions.md') ||
        customFiles.some(file => fileName.includes(file));
}

export function activate(context: vscode.ExtensionContext) {

    const regex = /Visual Studio Code/;
    if (!regex.test(vscode.env.appName)) {
        vscode.window.showErrorMessage("This extension can only be used with Visual Studio Code. Using it in any other product could cause unexpected behavior, performance, or security issues.", { modal: true });
        return;
    }

    // Initial check for active editor and eligibility
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const isEligible = isEligibleFile(activeEditor.document.fileName);
        vscode.commands.executeCommand('setContext', 'promptBoost.isEligibleFile', isEligible);
    } else {
        vscode.commands.executeCommand('setContext', 'promptBoost.isEligibleFile', false);
    }
    
    // Register an event listener for active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                const isEligible = isEligibleFile(editor.document.fileName);
                vscode.commands.executeCommand('setContext', 'promptBoost.isEligibleFile', isEligible);
            } else {
                vscode.commands.executeCommand('setContext', 'promptBoost.isEligibleFile', false);
            }
        })
    );


    registerAgentTools(context);

    const command = vscode.commands.registerTextEditorCommand(
        'promptBoost.boost',
        async (textEditor: vscode.TextEditor) => {
            // Only process .prompt.md and custom-instructions.md files
            if (!textEditor.document.fileName.endsWith('.prompt.md') && !textEditor.document.fileName.endsWith('custom-instructions.md')) {
                vscode.window.showErrorMessage('This command only works on .prompt.md and custom-instructions.md files');
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
