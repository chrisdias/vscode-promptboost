import * as vscode from 'vscode';
import { promptBoostOutputChannel } from './extension';

let currentModel: vscode.LanguageModelChat[] | undefined;

async function promptBoost(promptText: string): Promise<string> {

    // Claude 3.5 Sonnet
    // currentModel = await vscode.lm.selectChatModels({
    //     vendor: 'copilot',
    //     family: 'claude-3.5-sonnet'
    // });

    // gpt-4 if no claude model is available
    // if (!currentModel || currentModel.length === 0) {
    //     currentModel = await vscode.lm.selectChatModels({
    //         vendor: 'copilot',
    //         family: 'gpt-4'
    //     });
    // }

    // gpt-4o-mini is the default model for Copilot Chat
    if (!currentModel || currentModel.length === 0) {
        currentModel = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4o-mini'
        });
    }

    // if still no model, simply return the original prompt
    if (!currentModel || currentModel.length === 0) {
        promptBoostOutputChannel.appendLine("No model available");
        vscode.window.showWarningMessage("Sorry, unable to boost the prompt at this time.");
        return promptText;
    }

    const model = currentModel[0];

    promptBoostOutputChannel.appendLine(`Using model: ${model.name}`);

    let chatResponse: vscode.LanguageModelChatResponse | undefined;

    const messages = [

        // vscode.LanguageModelChatMessage.User(`

        //     You are a professional prompt engineer specializing in crafting precise, effective prompts.
        //     Your task is to enhance prompts by making them more specific, actionable, and effective.

        //     I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

        //     For valid prompts:
        //     - Make instructions explicit and unambiguous
        //     - Add relevant context and constraints
        //     - Remove redundant information
        //     - Maintain the core intent
        //     - Ensure the prompt is self-contained
        //     - Use professional language
        //     - Add references to documentation or examples if applicable

        //     For invalid or unclear prompts:
        //     - Respond with clear, professional guidance
        //     - Keep responses concise and actionable
        //     - Maintain a helpful, constructive tone
        //     - Focus on what the user should provide
        //     - Use a standard template for consistency

        //     IMPORTANT: Your response must ONLY contain the enhanced prompt text.
        //     Do not include any explanations, metadata, or wrapper tags.

        //     <original_prompt>
        //       ${promptText}
        //     </original_prompt>
        //   `),
        vscode.LanguageModelChatMessage.User(`
            You are a professional prompt engineer specializing in crafting precise, effective prompts.
            Your task is to enhance prompts by making them more specific, actionable, and effective.

            **Formatting Requirements:**
            - Use Markdown formatting in your response.
            - Present requirements, constraints, and steps as bulleted or numbered lists.
            - Separate context, instructions, and examples into clear paragraphs.
            - Use headings if appropriate.
            - Ensure the prompt is easy to read and visually organized.

            **Instructions:**
            - Improve the user prompt wrapped in \`<original_prompt>\` tags.
            - Make instructions explicit and unambiguous.
            - Add relevant context and constraints.
            - Remove redundant information.
            - Maintain the core intent.
            - Ensure the prompt is self-contained.
            - Use professional language.
            - Add references to documentation or examples if applicable.

            **For invalid or unclear prompts:**
            - Respond with clear, professional guidance.
            - Keep responses concise and actionable.
            - Maintain a helpful, constructive tone.
            - Focus on what the user should provide.
            - Use a standard template for consistency.

            **IMPORTANT:**  
            Your response must ONLY contain the enhanced prompt text, formatted as described.  
            Do not include any explanations, metadata, or wrapper tags.

            <original_prompt>
            ${promptText}
            </original_prompt>

          `),

    ];

    promptBoostOutputChannel.appendLine(`Boosting the prompt ${promptText} ...`);

    try {
        chatResponse = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );
    } catch (err) {
        promptBoostOutputChannel.appendLine(String(err));
        vscode.window.showWarningMessage("Sorry, unable to boost the prompt at this time.");
        return promptText;
    }

    if (!chatResponse) {
        vscode.window.showWarningMessage("Sorry, unable to boost the prompt at this time.");
        return promptText;
    }

    try {
        let newPrompt = '';
        for await (const fragment of chatResponse.text) {
            newPrompt += fragment;
        }
        promptBoostOutputChannel.appendLine(newPrompt);
        return newPrompt;
    } catch (err) {
        // async response stream may fail, e.g network interruption or server side error
        promptBoostOutputChannel.appendLine(String(err));
        vscode.window.showWarningMessage("Sorry, unable to boost the prompt at this time.");
        return promptText;
    }
}

export { promptBoost };

