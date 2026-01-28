import fs from 'fs/promises';
import path from 'path';

function normalizeForCompare(s) {
    if (s == null) return '';
    return s.replace(/\s+/g, ' ').trim();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    // ハイフンをスラッシュに変換
    let formatted = dateStr.replace(/-/g, '/');
    // 日付の2桁目に0がある場合それを消す（例：01/20 → 1/20）
    formatted = formatted.replace(/\/0(\d)/g, '/$1');
    return formatted;
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
        const dateFields = ['注文日', '支払完了日', '注文確定日', '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)', '発送日', '納品予定日'];

        // Excelデータを基準に比較
        this.excelData.forEach((excelRow, excelIdx) => {
            const excelOrderNo = excelRow['注文No.'];
            
            // 同じ注文No.のHTMLデータを検索
            let htmlRow = this.htmlData.find(h => h['注文No.'] === excelOrderNo);
            
            if (htmlRow) {
                usedExcelIndexes.add(excelIdx);
                
                // HTMLデータの日付をフォーマット
                const formattedHtmlRow = { ...htmlRow };
                dateFields.forEach(field => {
                    if (formattedHtmlRow[field]) {
                        formattedHtmlRow[field] = formatDate(formattedHtmlRow[field]);
                    }
                });
                
                // 発送日をハイフンからスラッシュに変更
                if (formattedHtmlRow['発送日']) {
                    formattedHtmlRow['発送日'] = formattedHtmlRow['発送日'].replace(/-/g, '/');
                }
                
                // 品番、髪飾り種別、カラーをチェック
                const productNumber = normalizeForCompare(excelRow['品番']);
                const type = normalizeForCompare(excelRow['髪飾り種別']);
                const color = normalizeForCompare(excelRow['カラー']);
                const orderContent = normalizeForCompare(formattedHtmlRow['注文内容']);
                
                const productMatch = productNumber ? orderContent.includes(productNumber) : true;
                const typeMatch = type ? orderContent.includes(type) : true;
                const colorMatch = color ? orderContent.includes(color) : true;
                const contentMatch = productMatch && typeMatch && colorMatch;
                
                // すべての項目を比較
                const compareResults = {};
                const allKeys = new Set([...Object.keys(excelRow), ...Object.keys(formattedHtmlRow)]);
                
                for (const field of allKeys) {
                    const excelVal = normalizeForCompare(excelRow[field] || '');
                    const htmlVal = normalizeForCompare(formattedHtmlRow[field] || '');
                    compareResults[field] = excelVal === htmlVal;
                }
                
                rows.push({
                    orderNo: excelOrderNo,
                    excelData: excelRow,
                    htmlData: formattedHtmlRow,
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
            const outPath = path.join(outDir, `${sanitizedOrderNo}.csv`);
            
            // すべてのキーを集める
            const allKeys = new Set();
            if (row.excelData) {
                Object.keys(row.excelData).forEach(k => allKeys.add(k));
            }
            if (row.htmlData) {
                Object.keys(row.htmlData).forEach(k => allKeys.add(k));
            }
            
            // キーの順序を定義（注文内容をお客様名と品番の間に配置）
            const keyOrder = [
                '注文No.', '注文日', '注文時間', 'お客様名', '注文内容', '品番', '髪飾り種別', 'カラー',
                '金額', 'クーポン利用', '合計金額', '支払種別', '支払完了日', '注文確定日',
                '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)', '配送日指定', '時間指定', '置き配指定',
                '発送元', '発送日', '納品予定日', 'お荷物伝票番号', '郵便番号', '送付先住所',
                '送付先宛名', '電話番号', 'キャンセル', '備考', 'ひとことメモ'
            ];
            
            const sortedKeys = keyOrder.filter(k => allKeys.has(k));
            // 定義にないキーを末尾に追加
            for (const k of allKeys) {
                if (!sortedKeys.includes(k)) {
                    sortedKeys.push(k);
                }
            }
            
            // CSV行を生成
            const lines = [];
            
            // ヘッダー行
            const headerRow = ['データソース', ...sortedKeys];
            lines.push(this.escapeCSV(headerRow));
            
            // Excelデータ行
            if (row.excelData) {
                const excelRow = ['[Excel データ]'];
                sortedKeys.forEach(key => {
                    if (key === '注文内容') {
                        // 品番、髪飾り種別、カラーを結合
                        const productNumber = row.excelData['品番'] || '';
                        const type = row.excelData['髪飾り種別'] || '';
                        const color = row.excelData['カラー'] || '';
                        const combined = [productNumber, type, color].filter(v => v).join(' ');
                        excelRow.push(combined);
                    } else {
                        excelRow.push(row.excelData[key] || '');
                    }
                });
                lines.push(this.escapeCSV(excelRow));
            }
            
            // HTMLデータ行
            if (row.htmlData) {
                const htmlRow = ['[HTML データ]'];
                sortedKeys.forEach(key => {
                    htmlRow.push(row.htmlData[key] || '');
                });
                lines.push(this.escapeCSV(htmlRow));
            }
            
            // 比較結果行
            const compareRow = ['比較結果'];
            sortedKeys.forEach(key => {
                if (key === '注文内容') {
                    // 品番、髪飾り種別、カラーが全て注文内容に含まれているかチェック
                    compareRow.push(row.contentMatch ? '○' : '×');
                } else if (row.fieldMatches[key] !== undefined) {
                    compareRow.push(row.fieldMatches[key] ? '○' : '×');
                } else {
                    compareRow.push('');
                }
            });
            lines.push(this.escapeCSV(compareRow));
            
            await fs.writeFile(outPath, lines.join('\n'), 'utf8');
            filePathList.push(outPath);
        }

        console.log(`✅ ${filePathList.length}個の比較結果ファイルを保存しました`);
        filePathList.forEach(p => console.log(`  - ${p}`));
        return filePathList;
    }

    escapeCSV(row) {
        return row.map(cell => {
            const str = String(cell || '');
            // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',');
    }

    async writeTxtResult(rows) {
        const outDir = path.join(this.basePath, 'result');
        try {
            await fs.mkdir(outDir, { recursive: true });
        } catch (e) { }

        // 注文No.ごとにファイルを作成
        const filePathList = [];

        for (const row of rows) {
            const orderNo = row.orderNo || 'unknown';
            const sanitizedOrderNo = orderNo.replace(/[\\/:*?"<>|]/g, '_');
            const txtPath = path.join(outDir, `${sanitizedOrderNo}.txt`);

            // すべてのキーを集める
            const allKeys = new Set();
            if (row.excelData) {
                Object.keys(row.excelData).forEach(k => allKeys.add(k));
            }
            if (row.htmlData) {
                Object.keys(row.htmlData).forEach(k => allKeys.add(k));
            }

            // キーの順序を定義（注文内容をお客様名と品番の間に配置）
            const keyOrder = [
                '注文No.', '注文日', '注文時間', 'お客様名', '注文内容', '品番', '髪飾り種別', 'カラー',
                '金額', 'クーポン利用', '合計金額', '支払種別', '支払完了日', '注文確定日',
                '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)', '配送日指定', '時間指定', '置き配指定',
                '発送元', '発送日', '納品予定日', 'お荷物伝票番号', '郵便番号', '送付先住所',
                '送付先宛名', '電話番号', 'キャンセル', '備考', 'ひとことメモ'
            ];

            const sortedKeys = keyOrder.filter(k => allKeys.has(k));
            // 定義にないキーを末尾に追加
            for (const k of allKeys) {
                if (!sortedKeys.includes(k)) {
                    sortedKeys.push(k);
                }
            }

            // テーブル形式で出力
            const lines = [];
            lines.push(`\n=== 注文No.: ${row.orderNo} ===\n`);

            // テーブルの列幅を計算
            const fieldWidth = 25;
            const dataWidth = 35;
            const compareWidth = 6;

            // ヘッダー行
            const header = 'フィールド'.padEnd(fieldWidth) +
                           'Excel'.padEnd(dataWidth) +
                           'HTML'.padEnd(dataWidth) +
                           '比較';
            lines.push(header);
            lines.push('─'.repeat(fieldWidth + dataWidth + dataWidth + compareWidth));

            // データ行
            sortedKeys.forEach(key => {
                let excelVal = '';
                let htmlVal = '';

                if (row.excelData) {
                    if (key === '注文内容') {
                        // 品番、髪飾り種別、カラーを結合
                        const productNumber = row.excelData['品番'] || '';
                        const type = row.excelData['髪飾り種別'] || '';
                        const color = row.excelData['カラー'] || '';
                        excelVal = [productNumber, type, color].filter(v => v).join(' ');
                    } else {
                        excelVal = row.excelData[key] || '';
                    }
                }

                if (row.htmlData) {
                    htmlVal = row.htmlData[key] || '';
                }

                // 比較結果
                let compareVal = '';
                if (key === '注文内容') {
                    compareVal = row.contentMatch ? '○' : '×';
                } else if (row.fieldMatches[key] !== undefined) {
                    compareVal = row.fieldMatches[key] ? '○' : '×';
                }

                const excelDisplay = String(excelVal).substring(0, dataWidth - 1);
                const htmlDisplay = String(htmlVal).substring(0, dataWidth - 1);

                lines.push(
                    String(key).padEnd(fieldWidth) +
                    excelDisplay.padEnd(dataWidth) +
                    htmlDisplay.padEnd(dataWidth) +
                    compareVal
                );
            });

            lines.push('');

            await fs.writeFile(txtPath, lines.join('\n'), 'utf8');
            filePathList.push(txtPath);
        }

        console.log(`✅ ${filePathList.length}個のテキスト形式ファイルを保存しました`);
        filePathList.forEach(p => console.log(`  - ${p}`));
        return filePathList;
    }



}
