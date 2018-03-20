const vscode = require('vscode');
const AdonisAutocomplete = require('./AdonisAutocomplete');

module.exports.activate = (context) => {
  var selector = 'javascript';
  context.subscriptions
    .push(
      vscode.languages.registerCompletionItemProvider(
        selector,
        new AdonisAutocomplete(),
        '/')
    );
}

// this method is called when your extension is deactivated
module.exports.deactivate = () => {}