import Main from './src/Main.js';
import path from 'path';

// SEA対応：コマンドライン引数でHTMLフォルダパスを取得
const htmlFolderArg = process.argv[2] || './html';

// 絶対パスに変換
const htmlFolderPath = path.resolve(htmlFolderArg);

// Main をインスタンス化してパスを渡す
new Main(htmlFolderPath);

