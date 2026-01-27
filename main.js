import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export default class HtmlDataExtractor {
    constructor(folderName, config) {
        // import.meta.url を使うのがES Modulesでのパス取得の標準です
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        // Windows環境でのパスの不整合を防ぐため、先頭の / を除去（環境に応じて調整）
        this.targetDir = path.join(process.platform === 'win32' ? __dirname.substring(1) : __dirname, folderName);

        this.config = config;
        this.results = [];
        this.init();
    }

    init() {
        const filePaths = this.getHtmlFilePaths();
        if (filePaths.length === 0) {
            console.log('❌ 対象のHTMLファイルが見つかりませんでした。');
            return;
        }

        filePaths.forEach(filePath => {
            const data = this.extractData(filePath);
            this.results.push({ fileName: path.basename(filePath), ...data });
        });

        this.displayResults();
    }

    getHtmlFilePaths() {
        try {
            const files = fs.readdirSync(this.targetDir);
            return files
                .filter(file => path.extname(file).toLowerCase() === '.html')
                .map(file => path.join(this.targetDir, file));
        } catch (err) {
            console.error('ディレクトリ読み込み失敗:', err);
            return [];
        }
    }

    extractData(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        const result = {};

        Object.keys(this.config).forEach(key => {
            const config = this.config[key];
            // 文字列の場合は直接セレクタ、オブジェクトの場合はselectorプロパティを使用
            const selector = typeof config === 'string' ? config : config.selector;
            const type = typeof config === 'string' ? 'text' : (config.type || 'text');

            const element = $(selector).first();
            
            // typeに応じて取得方法を変更
            if (type === 'value') {
                result[key] = element.val() || element.attr('value') || '';
            } else {
                result[key] = element.text().replace(/\s+/g, ' ').trim();
            }
        });

        return result;
    }

    displayResults() {
        console.log('\n' + '★'.repeat(25));
        console.log(`  データ抽出レポート (${this.results.length}件)`);
        console.log('★'.repeat(25) + '\n');

        this.results.forEach((item) => {
            console.log(`■ ファイル名: ${item.fileName}`);
            Object.keys(this.config).forEach(key => {
                console.log(`  └ ${key}: ${item[key]}`);
            });
            console.log('');
        });
    }
}