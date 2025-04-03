import * as vscode from 'vscode';

async function promptBoost(promptText: string): Promise<string> {
    const models = await vscode.lm.selectChatModels({
        vendor: 'copilot',
        family: 'gpt-4o'
    });

    if (!models || models.length === 0) {
        console.log("No compatible model found");
        return promptText;
    }


    const model = models[0];
    let chatResponse: vscode.LanguageModelChatResponse | undefined;

    const messages = [

        //from https://huggingface.co/spaces/strangehunteryt/bolt-diy-ai/resolve/e31e17169f6795a7d4515bbe760a274b6ee1f954/app/routes/api.enhancer.ts?download=true

        // You are a professional prompt engineer specializing in crafting precise, effective prompts.
        //     Your task is to enhance prompts by making them more specific, actionable, and effective.

        //     I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

        //     For valid prompts:
        //     - Make instructions explicit and unambiguous
        //     - Add relevant context and constraints
        //     - Remove redundant information
        //     - Maintain the core intent
        //     - Ensure the prompt is self-contained
        //     - Use professional language

        //     For invalid or unclear prompts:
        //     - Respond with clear, professional guidance
        //     - Keep responses concise and actionable
        //     - Maintain a helpful, constructive tone
        //     - Focus on what the user should provide
        //     - Use a standard template for consistency

        //     IMPORTANT: Your response must ONLY contain the enhanced prompt text.
        //     Do not include any explanations, metadata, or wrapper tags.

        vscode.LanguageModelChatMessage.User(`
            You are an AI assistant that enhances an underspecified prompt into a fully fleshed-out prompt.
            Follow these steps:

            1. Analyze the user's original prompt for any missing or ambiguous details.
            2. Infer the most likely or useful defaults. If the user doesn't specify a project type, framework, configuration, or constraints, assume reasonable choices based on best practices or common usage.
            3. Synthesize all assumptions, clarifications, and best guesses into a single, enriched prompt.
            4. Present only the final, improved prompt. Do not pose any questions or ask for additional information. Do not include Code or other programming language snippets in your response, just a plain text prompt.

            Make sure your enhanced prompt is:
            - Thorough and specific but the result should be just a few lines the user can update in a multi-line chat prompt box
            - Self-contained, requiring no further clarifications
            - Easy to execute or act upon
            - Reflective of common standards and best practices if the user's request is incomplete

            IMPORTANT: Your response must ONLY contain the enhanced prompt text.
            Do not include any explanations, code, metadata, or wrapper tags.
        `),

        vscode.LanguageModelChatMessage.User(promptText)
    ];

    console.log("boosting the prompt...");

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

