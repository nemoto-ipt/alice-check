import fs from 'fs';
import path from 'path';

export default class ExcelDataExtractor {
    constructor(headerFile, dataFile) {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        this.headerFilePath = path.join(process.platform === 'win32' ? __dirname.substring(1) : __dirname, headerFile);
        this.dataFilePath = path.join(process.platform === 'win32' ? __dirname.substring(1) : __dirname, dataFile);
        
        this.results = [];
        this.init();
    }

    init() {
        // ヘッダーを取得
        const headerContent = fs.readFileSync(this.headerFilePath, 'utf8');
        const headerLine = headerContent.trim();
        const keys = headerLine.split('\t').map(key => key.replace(/"/g, ''));

        // データを読込
        const dataContent = fs.readFileSync(this.dataFilePath, 'utf8');
        const lines = dataContent.trim().split('\n');

        lines.forEach(line => {
            const values = line.split('\t');
            
            // 最初の要素（行番号）を無視して、2番目から処理
            const dataValues = values.slice(1);

            const result = {};
            keys.forEach((key, index) => {
                result[key] = dataValues[index] || '';
            });

            this.results.push(result);
        });

        this.displayResults();
    }

    displayResults() {
        console.log(JSON.stringify(this.results, null, 2));
    }
}

