import fs from 'fs';
import path from 'path';

export default class ExcelDataExtractor {
    constructor(excelTemplateFile, dataFile) {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        this.excelTemplatePath = path.join(process.platform === 'win32' ? __dirname.substring(1) : __dirname, excelTemplateFile);
        this.dataFilePath = path.join(process.platform === 'win32' ? __dirname.substring(1) : __dirname, dataFile);
        
        this.excelTemplate = JSON.parse(fs.readFileSync(this.excelTemplatePath, 'utf8'));
        this.results = [];
        this.init();
    }

    init() {
        const content = fs.readFileSync(this.dataFilePath, 'utf8');
        const lines = content.trim().split('\n');

        const keys = Object.keys(this.excelTemplate);

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
