import * as vscode from 'vscode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function promptBoost(promptText: string): Promise<any> {

    const [model] = await vscode.lm.selectChatModels({
        vendor: 'copilot',
        family: 'gpt-4o'
    });
    let chatResponse: vscode.LanguageModelChatResponse | undefined;



    const messages = [
        vscode.LanguageModelChatMessage.User(`
            You are an AI assistant that enhances an underspecified prompt into a fully fleshed-out prompt.
            Follow these steps:

            1. Analyze the user's original prompt for any missing or ambiguous details.
            2. Infer the most likely or useful defaults.If the user doesn't specify a project type, framework, configuration, or constraints, assume reasonable choices based on best practices or common usage.
            3. Synthesize all assumptions, clarifications, and best guesses into a single, enriched prompt.
            4. Present only the final, improved prompt.Do not pose any questions or ask for additional information.

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

    console.log("in promptBoost");


    try {
        chatResponse = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );
    } catch (err) {
        if (err instanceof vscode.LanguageModelError) {
            console.log(err.message, err.code, err.cause);
        } else {
            throw err;
        }
        return;
    }

    let newPrompt = '';

    try {
        for await (const fragment of chatResponse.text) {
            newPrompt += fragment;
        }
        console.log(newPrompt);
        return newPrompt;
    } catch (err) {
        // async response stream may fail, e.g network interruption or server side error
        console.log(err);
        return;
    }

}




export { promptBoost };

