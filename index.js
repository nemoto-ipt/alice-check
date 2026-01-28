import Main from './src/Main.js';
import path from 'path';

// SEA対応：コマンドライン引数でデータフォルダパスとタイプを取得
const htmlFolderArg = process.argv[2] || './html';
const excelFolderArg = process.argv[2] || './excel';

// 絶対パスに変換
const htmlFolderPath = path.resolve(htmlFolderArg);
const excelFolderPath = path.resolve(excelFolderArg);

// Main をインスタンス化してパスとタイプを渡す
new Main(htmlFolderPath, excelFolderPath);

