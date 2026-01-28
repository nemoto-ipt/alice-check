import Main from './src/Main.js';
import path from 'path';

// HTMLフォルダパスとExcelフォルダパスを取得
const htmlFolderArg = './html';
const excelFolderArg = './excel';

// 絶対パスに変換
const htmlFolderPath = path.resolve(htmlFolderArg);
const excelFolderPath = path.resolve(excelFolderArg);

// Main をインスタンス化して比較を実行
new Main(htmlFolderPath, excelFolderPath);

