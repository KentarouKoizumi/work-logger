import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("work-loggerがアクティベートされました!");

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

  const workLogProvider = new WorkLogProvider(logEntries);
  vscode.window.registerTreeDataProvider("workLog", workLogProvider);

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
      logEntries.push(logEntry);

      fs.writeFileSync(
        logFilePath,
        JSON.stringify(logEntries, null, 2),
        "utf8"
      );
      vscode.window.showInformationMessage("メモが保存されました!");
      workLogProvider.refresh();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("work-loggerがデアクティベートされました!");
}

class WorkLogProvider implements vscode.TreeDataProvider<LogItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    LogItem | undefined | void
  > = new vscode.EventEmitter<LogItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<LogItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private logEntries: { time: number; note: string }[];

  constructor(logEntries: { time: number; note: string }[]) {
    this.logEntries = logEntries;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: LogItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: LogItem): Thenable<LogItem[]> {
    if (!element) {
      return Promise.resolve(this.getLogItems());
    }
    return Promise.resolve([]);
  }

  private getLogItems(): LogItem[] {
    return this.logEntries
      .slice()
      .reverse()
      .map(
        (entry) =>
          new LogItem(
            entry.note,
            new Date(entry.time).toLocaleString(),
            vscode.TreeItemCollapsibleState.None
          )
      );
  }
}

class LogItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly date: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.description = date;
  }

  contextValue = "logItem";
}
