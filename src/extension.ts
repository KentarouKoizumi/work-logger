import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "work-logger" is now active!');

  const disposable = vscode.commands.registerCommand(
    "work-logger.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from work-logger!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
