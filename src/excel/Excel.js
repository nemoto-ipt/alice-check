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
                const result = {};
                keys.forEach((key, index) => {
                    result[key] = values[index] || '';
                });
                results.push(result);
            });

            console.log(JSON.stringify(results, null, 2));
        } catch (err) {
            console.error('データ抽出失敗:', err.message);
        }
    }
}
