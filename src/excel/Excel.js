import fs from 'fs';
import path from 'path';

export default class ExcelReader {
    constructor(folderPath) {
        this.targetDir = path.isAbsolute(folderPath) ? folderPath : path.resolve(folderPath);
        this.recordFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'record.txt');
        this.excelFilePath = path.join(this.targetDir, 'excel.txt');
        
        const fixedPath = process.platform === 'win32' ? this.recordFilePath.substring(1) : this.recordFilePath;
        this.recordFilePath = fixedPath;
        
        this.init();
    }

    init() {
        try {
            // record.txtを読み込む（ヘッダー情報）
            const headerContent = fs.readFileSync(this.recordFilePath, 'utf8');
            const keys = headerContent.trim().split('\t');

            // excel.txtを読み込み
            const content = fs.readFileSync(this.excelFilePath, 'utf8');
            const lines = content.trim().split('\n');

            const results = [];
            lines.forEach(line => {
                if (!line.trim()) return;
                
                const values = line.split('\t');
                // 最初の要素（行番号）を無視して2番目から処理
                const dataValues = values.slice(1);
                
                const result = {};
                keys.forEach((key, index) => {
                    result[key] = dataValues[index] || '';
                });
                results.push(result);
            });

            return results;
        } catch (err) {
            console.error('データ抽出失敗:', err.message);
            return [];
        }
    }

    getResults() {
        return this.init();
    }
}
