# Prompt Boost

This extension contributes a Tool to VS Code's Agent mode that enhances your simple prompts into more complete ones.

## Prerequisites
- Node.js (v20 or later) and npm (v9 or later) https://nodejs.org/
- Visual Studio Code INSIDERS (v1.99 or later) https://code.visualstudio.com/insiders/
- GitHub Copilot Chat PRERELEASE (0.26.2025031701 or later)

Check your Node versions:

```bash
node -v
npm -v
```

## Get the Source

``` bash
git clone https://github.com/chrisdias/vscode-prompt-boost.git
cd vscode-prompt-boost
```

## Install dependencies, open VS Code, and run the extension

```bash
npm install && code-insiders . -r
```


Once in VS Code open the Debug View (`Ctrl+Shift+D`) and select the `Run Extension` target.

The extension will build and then a new instance of VS Code will open with the extension loaded. You can use this instance to test this extension.

Open the Chat View, choose the Agent mode, and write your prompt, asking Copilot to "boost" its power

_"I want to create a new "ToDo" web app in node. First, boost this prompt with the prompt boost tool and then write the code for the app"_



## API Documentation

- https://code.visualstudio.com/api/extension-guides/chat
- https://code.visualstudio.com/api/extension-guides/language-model

