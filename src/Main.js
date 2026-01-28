import HtmlDataExtractor from './html/Html.js';
import fs from 'fs';
import path from 'path';

export default class Main {
    constructor(htmlFolderPath) {
        this.htmlFolderPath = htmlFolderPath;
        this.init();
    }

    init() {
        // htmlClass.json の設定を読み込む
        const configPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'html', 'htmlClass.json');
        const fixedPath = process.platform === 'win32' ? configPath.substring(1) : configPath;
        
        try {
            const configData = fs.readFileSync(fixedPath, 'utf8');
            const config = JSON.parse(configData);
            
            // HtmlDataExtractor を初期化して実行
            new HtmlDataExtractor(this.htmlFolderPath, config);
        } catch (err) {
            console.error('設定ファイルの読み込み失敗:', err);
        }
    }

}