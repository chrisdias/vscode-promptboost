import * as vscode from 'vscode';
import { promptBoost } from './promptBoost';

export function registerAgentTools(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.lm.registerTool('promptboost', new promptBoostTool()));
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
		options: vscode.LanguageModelToolInvocationPrepareOptions<IPromptBoostParameters>,
		_token: vscode.CancellationToken
	) {

		console.log(options.input.promptText);
		return {
			invocationMessage: `Boosting your prompt to be a 10x developer like Simon Calvert`
		};
	}
}


