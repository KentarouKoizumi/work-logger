import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("work-loggerがアクティベートされました!");

  let disposable = vscode.commands.registerCommand(
    "work-logger.logWork",
    async () => {
      const note = await vscode.window.showInputBox({
        prompt: "メモを入力してください:",
      });

      if (!note) {
        vscode.window.showErrorMessage("メモが入力されませんでした。");
        return;
      }

      const time = Date.now();
      const logEntry = { time, note };

      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("ワークスペースが開いていません。");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const logFilePath = path.join(workspacePath, "working-log.json");

      let logEntries: { time: number; note: string }[] = [];
      if (fs.existsSync(logFilePath)) {
        const logFileContent = fs.readFileSync(logFilePath, "utf8");
        logEntries = JSON.parse(logFileContent);
      }

      logEntries.push(logEntry);

      fs.writeFileSync(
        logFilePath,
        JSON.stringify(logEntries, null, 2),
        "utf8"
      );
      vscode.window.showInformationMessage("メモが保存されました!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("work-loggerがデアクティベートされました!");
}
