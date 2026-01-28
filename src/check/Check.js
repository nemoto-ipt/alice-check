import fs from 'fs/promises';
import path from 'path';

function normalizeForCompare(s) {
    if (s == null) return '';
    return s.replace(/\s+/g, ' ').trim();
}

export default class Checker {
    constructor(basePath) {
        this.basePath = basePath;
        this.htmlData = [];
        this.excelData = [];
    }

    setHtmlData(data) {
        this.htmlData = Array.isArray(data) ? data : [data];
    }

    setExcelData(data) {
        this.excelData = Array.isArray(data) ? data : [data];
    }

    compare() {
        const rows = [];
        const usedExcelIndexes = new Set();

        // Excelデータを基準に比較
        this.excelData.forEach((excelRow, excelIdx) => {
            const excelOrderNo = excelRow['注文No.'];
            
            // 同じ注文No.のHTMLデータを検索
            const htmlRow = this.htmlData.find(h => h['注文No.'] === excelOrderNo);
            
            if (htmlRow) {
                usedExcelIndexes.add(excelIdx);
                
                // 品番、髪飾り種別、カラーをチェック
                const productNumber = normalizeForCompare(excelRow['品番']);
                const type = normalizeForCompare(excelRow['髪飾り種別']);
                const color = normalizeForCompare(excelRow['カラー']);
                const orderContent = normalizeForCompare(htmlRow['注文内容']);
                
                const productMatch = productNumber ? orderContent.includes(productNumber) : true;
                const typeMatch = type ? orderContent.includes(type) : true;
                const colorMatch = color ? orderContent.includes(color) : true;
                const contentMatch = productMatch && typeMatch && colorMatch;
                
                // その他の項目も比較
                const fields = ['注文No.', '金額', '合計金額', '支払種別'];
                const compareResults = {};
                
                for (const field of fields) {
                    const excelVal = normalizeForCompare(excelRow[field]);
                    const htmlVal = normalizeForCompare(htmlRow[field]);
                    compareResults[field] = excelVal === htmlVal;
                }
                
                rows.push({
                    orderNo: excelOrderNo,
                    excelData: excelRow,
                    htmlData: htmlRow,
                    productMatch,
                    typeMatch,
                    colorMatch,
                    contentMatch,
                    fieldMatches: compareResults
                });
            } else {
                // HTMLに対応するデータがない
                rows.push({
                    orderNo: excelOrderNo,
                    excelData: excelRow,
                    htmlData: null,
                    productMatch: false,
                    typeMatch: false,
                    colorMatch: false,
                    contentMatch: false,
                    fieldMatches: {}
                });
            }
        });

        // HTMLのみのデータ
        this.htmlData.forEach(htmlRow => {
            const htmlOrderNo = htmlRow['注文No.'];
            const exists = this.excelData.some((e, idx) => e['注文No.'] === htmlOrderNo && usedExcelIndexes.has(idx));
            
            if (!exists) {
                rows.push({
                    orderNo: htmlOrderNo,
                    excelData: null,
                    htmlData: htmlRow,
                    productMatch: false,
                    typeMatch: false,
                    colorMatch: false,
                    contentMatch: false,
                    fieldMatches: {}
                });
            }
        });

        return rows;
    }

    async writeResult(rows) {
        const outDir = path.join(this.basePath, 'result');
        try {
            await fs.mkdir(outDir, { recursive: true });
        } catch (e) { }

        // 注文No.ごとにファイルを作成
        const filePathList = [];
        
        for (const row of rows) {
            const orderNo = row.orderNo || 'unknown';
            const sanitizedOrderNo = orderNo.replace(/[\\/:*?"<>|]/g, '_');
            const outPath = path.join(outDir, `${sanitizedOrderNo}.txt`);
            
            const lines = [];
            lines.push(`注文No.: ${orderNo}`);
            lines.push('='.repeat(60));
            lines.push('');
            
            // Excel データ
            if (row.excelData) {
                lines.push('[Excel データ]');
                for (const [key, value] of Object.entries(row.excelData)) {
                    lines.push(`${key}: ${value}`);
                }
            } else {
                lines.push('[Excel データ] なし');
            }
            
            lines.push('');
            lines.push('-'.repeat(60));
            lines.push('');
            
            // HTML データ
            if (row.htmlData) {
                lines.push('[HTML データ]');
                for (const [key, value] of Object.entries(row.htmlData)) {
                    lines.push(`${key}: ${value}`);
                }
            } else {
                lines.push('[HTML データ] なし');
            }
            
            lines.push('');
            lines.push('-'.repeat(60));
            lines.push('');
            
            // 比較結果
            lines.push('[比較結果]');
            lines.push(`品番マッチ: ${row.productMatch ? '○' : '×'}`);
            lines.push(`髪飾り種別マッチ: ${row.typeMatch ? '○' : '×'}`);
            lines.push(`カラーマッチ: ${row.colorMatch ? '○' : '×'}`);
            lines.push(`注文内容総合判定: ${row.contentMatch ? '○' : '×'}`);
            lines.push('');
            
            for (const [field, match] of Object.entries(row.fieldMatches)) {
                lines.push(`${field}: ${match ? '○' : '×'}`);
            }
            
            await fs.writeFile(outPath, lines.join('\n'), 'utf8');
            filePathList.push(outPath);
        }

        console.log(`✅ ${filePathList.length}個の比較結果ファイルを保存しました`);
        filePathList.forEach(p => console.log(`  - ${p}`));
        return filePathList;
    }
}
