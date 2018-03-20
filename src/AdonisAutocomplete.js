const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const File = require('./File');

class AdonisAutocomplete {
  provideCompletionItems(document, position, token) {
    var currentLine = document.getText(document.lineAt(position).range);
    this.currentFile = document.fileName;

    console.log('success trigger')
    if (!this.shouldProvide(currentLine, position.character) || !currentLine.includes('use(')) {
      console.log('should\'t provide')
      return Promise.resolve([]);
    }
    const rootFolder = this.getRootFoolder;
    const formattedPath = this.formatPath(currentLine);
    const folderPath = rootFolder + '/' + formattedPath;
    if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
      console.log('should\'t provide');
      return Promise.resolve([]);
    }
    return this.getFolderItems(folderPath).then((items) => {
      // build the list of the completion items
      var result = items.map((file) => {
        var completion = new vscode.CompletionItem(file.getName());

        completion.insertText = this.getInsertText(file);

        // show folders before files
        if (file.isDirectory) {
          completion.label += '/';
          completion.sortText = 'd';
        } else {
          completion.sortText = 'f';
        }

        completion.kind = vscode.CompletionItemKind.File;

        return completion;
      });

      // add up one folder item
      result.unshift(new vscode.CompletionItem('..'))

      return Promise.resolve(result);
    });
  }
  getInsertText(file) {
      var insertText = '';
      if (file.isDirectory) {
          insertText = path.basename(file.getName());
      } else {
          // remove the extension
          insertText = path.basename(file.getName(), path.extname(file.getName()));
      }
      return insertText;
  }
  /**
   * Convert to filepath to FS format
   */
  formatPath(path) {
    const formattedPath = path.match(/use\('(.*)\'\)/);
    return formattedPath ? formattedPath[1] : null;
  }
  get getRootFoolder() {
    return vscode.workspace.workspaceFolders ?
      vscode.workspace.workspaceFolders[0].uri.fsPath :
      null;
  }
  getFolderItems(folderPath) {
    return new Promise(function (resolve, reject) {
      fs.readdir(folderPath, function (err, items) {
        if (err) {
          return reject(err);
        }
        var results = [];

        items.forEach(item => {
          try {
            results.push(new File(path.join(folderPath, item)));
          } catch (err) {
            // silently ignore permissions errors
          }
        });

        resolve(results);
      });
    });
  }
  /**
   * Determine if we should provide path completion.
   */
  shouldProvide(currentLine, position) {
    var quotes = {
      single: 0,
      double: 0,
      backtick: 0
    };

    // check if we are inside quotes
    for (var i = 0; i < position; i++) {
      if (currentLine.charAt(i) == "'" && currentLine.charAt(i - 1) != '\\') {
        quotes.single += quotes.single > 0 ? -1 : 1;
      }

      if (currentLine.charAt(i) == '"' && currentLine.charAt(i - 1) != '\\') {
        quotes.double += quotes.double > 0 ? -1 : 1;
      }

      if (currentLine.charAt(i) == '`' && currentLine.charAt(i - 1) != '\\') {
        quotes.backtick += quotes.backtick > 0 ? -1 : 1;
      }
    }

    return !!(quotes.single || quotes.double || quotes.backtick);
  }
}

module.exports = AdonisAutocomplete