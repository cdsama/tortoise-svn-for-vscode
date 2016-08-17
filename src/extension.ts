'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "tortoise-svn-for-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    let actions = ['commit', 'diff', 'revert', 'update', 'add', 'rename', 'log', 'blame', 'lock', 'unlock'];
    let disposablePick = vscode.commands.registerCommand('tortoise.pick', (fileUri) => {
        vscode.window.showQuickPick(actions).then((param) => {
            if (param) {
                new TortoiseCommand(param, getPath(fileUri)).run();
            }
        });
    });
    let disposablePickRoot = vscode.commands.registerCommand('tortoise.pickroot', () => {
        vscode.window.showQuickPick(actions).then((param) => {
            if (param) {
                new TortoiseCommand(param, vscode.workspace.rootPath).run();
            }
        });
    });

    context.subscriptions.push(disposablePick);

    actions.forEach((action: string) => {
        let disposableAction = vscode.commands.registerCommand('tortoise.' + action, (fileUri) => {
            new TortoiseCommand(action, getPath(fileUri)).run();
        });

        context.subscriptions.push(disposableAction);
    });

}

// this method is called when your extension is deactivated
export function deactivate() {
}
let TortoiseSVNProcExe = "\"C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe\"";
try {
    let ans = child_process.execSync("reg query HKEY_LOCAL_MACHINE\\SOFTWARE\\TortoiseSVN /v ProcPath | find /i \"ProcPath\"").toString().split("    ");
TortoiseSVNProcExe = "\"" + ans[ans.length -1 ].replace("\n","") + "\"";
} catch (error) {
    console.log(error);
}

function getPath(fileUri): string {
    let fileName = '';
    if (fileUri && fileUri.fsPath) {
        fileName = fileUri.fsPath;
    } else {
        if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
            fileName = vscode.workspace.rootPath;
        } else {
            fileName = vscode.window.activeTextEditor.document.fileName;
        }
    }
    return fileName;
}

/**
 * TortoiseCommand
 */
class TortoiseCommand {
    command: string;
    constructor(action: string, path: string) {
        this.command = TortoiseSVNProcExe +" /command:" + action + " /path \"" + path + "\"";
    }
    run() {
        child_process.exec(this.command, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
            }
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
        });
    }
}