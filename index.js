import Main from './src/Main.js';
import path from 'path';
import process from 'node:process'
import readline from 'readline';
import { fileURLToPath } from 'url';

// fork test

// EXEディレクトリを特定
let exeDir;
try {
    // 通常のNode.js実行環境
    const __filename = fileURLToPath(import.meta.url);
    exeDir = path.dirname(__filename);
} catch {
    // SEA/EXE環境
    exeDir = path.dirname(process.execPath);
}

// EXEディレクトリを基準にhtml/excelフォルダを指定
const htmlFolderPath = path.join(exeDir, 'html');
const excelFolderPath = path.join(exeDir, 'excel');

async function run() {
    try {
        // Main をインスタンス化して比較を実行
        await new Main(htmlFolderPath, excelFolderPath);
        console.log('✅ 処理が完了しました。');
    } catch (err) {
        console.error('❌ エラーが発生しました:');
        console.error(err);
    } finally {
        // 処理完了後に一時停止
        waitForInput();
    }
}

function waitForInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('\n任意のキーを押してウィンドウを閉じてください...', () => {
        rl.close();
        process.exit(0);
    });
}

run();

