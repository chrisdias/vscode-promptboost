import * as vscode from 'vscode';

let currentModel: vscode.LanguageModelChat[] | undefined;

async function promptBoost(promptText: string): Promise<string> {

    // Try to use Claude 3.5 Sonnet model first
    currentModel = await vscode.lm.selectChatModels({
        vendor: 'copilot',
        family: 'claude-3.5-sonnet'
    });

    // fallback to gpt-4 if no claude model is available
    if (!currentModel || currentModel.length === 0) {
        currentModel = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4'
        });
    }
    // if still no model, simply return the original prompt
    if (!currentModel || currentModel.length === 0) {
        console.log("No model available");
        return promptText;
    }

    const model = currentModel[0];
    let chatResponse: vscode.LanguageModelChatResponse | undefined;

    const messages = [

        vscode.LanguageModelChatMessage.User(`

            You are a professional prompt engineer specializing in crafting precise, effective prompts.
            Your task is to enhance prompts by making them more specific, actionable, and effective.

            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            For valid prompts:
            - Make instructions explicit and unambiguous
            - Add relevant context and constraints
            - Remove redundant information
            - Maintain the core intent
            - Ensure the prompt is self-contained
            - Use professional language
            - Add references to documentation or examples if applicable

            For invalid or unclear prompts:
            - Respond with clear, professional guidance
            - Keep responses concise and actionable
            - Maintain a helpful, constructive tone
            - Focus on what the user should provide
            - Use a standard template for consistency

            IMPORTANT: Your response must ONLY contain the enhanced prompt text.
            Do not include any explanations, metadata, or wrapper tags.

            <original_prompt>
              ${promptText}
            </original_prompt>
          `),

    ];

    console.log(`boosting the prompt ${promptText} ...`);

    try {
        chatResponse = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );
    } catch (err) {
        console.log(err);
        return promptText;
    }

    if (!chatResponse) {
        return promptText;
    }

    try {
        let newPrompt = '';
        for await (const fragment of chatResponse.text) {
            newPrompt += fragment;
        }
        console.log(newPrompt);
        return newPrompt;
    } catch (err) {
        // async response stream may fail, e.g network interruption or server side error
        console.log(err);
        return promptText;
    }
}

export { promptBoost };

