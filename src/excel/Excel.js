import fs from 'fs';
import path from 'path';

// デフォルトヘッダー（record.txtが見つからない場合に使用）
// 注文No.	注文日	注文時間	お客様名	品番	髪飾り種別	カラー	金額	クーポン利用	合計金額	支払種別	支払完了日	注文確定日	依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)	配送日指定	時間指定	置き配指定	発送元	発送日	納品予定日	お荷物伝票番号	郵便番号	送付先住所	送付先宛名	電話番号	キャンセル	備考
const DEFAULT_HEADERS = ['注文No.', '注文日', '注文時間', 'お客様名', '品番', '髪飾り種別', 'カラー', '金額', 'クーポン利用', '合計金額', '支払種別', '支払完了日', '注文確定日', '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)', '配送日指定', '時間指定', '置き配指定', '発送元', '発送日', '納品予定日', 'お荷物伝票番号', '郵便番号', '送付先住所', '送付先宛名', '電話番号', 'キャンセル', '備考'];

export default class ExcelReader {
    constructor(folderPath) {
        this.targetDir = path.isAbsolute(folderPath) ? folderPath : path.resolve(folderPath);
        
        // record.txtを探す（なくてもOK、デフォルトヘッダーを使用）
        let recordFilePath;
        const possiblePaths = [
            // 通常のNode.js環境（モジュール相対）
            () => {
                try {
                    return path.join(path.dirname(new URL(import.meta.url).pathname), 'record.txt');
                } catch {
                    return null;
                }
            },
            // プロセスのカレントディレクトリ
            () => path.join(process.cwd(), 'src', 'excel', 'record.txt'),
        ];
        
        for (const pathFn of possiblePaths) {
            try {
                const testPath = pathFn();
                if (testPath && fs.existsSync(testPath)) {
                    recordFilePath = testPath;
                    if (process.platform === 'win32' && recordFilePath.startsWith('\\')) {
                        recordFilePath = recordFilePath.substring(1);
                    }
                    break;
                }
            } catch (e) {
                // パスの取得に失敗した場合は次を試す
            }
        }
        
        this.recordFilePath = recordFilePath;
        this.excelFilePath = path.join(this.targetDir, 'excel.txt');
        
        this.init();
    }

    init() {
        try {
            // record.txtを読み込むか、デフォルトヘッダーを使用
            let keys;
            if (this.recordFilePath && fs.existsSync(this.recordFilePath)) {
                const headerContent = fs.readFileSync(this.recordFilePath, 'utf8');
                keys = headerContent.trim().split('\t');
            } else {
                keys = DEFAULT_HEADERS;
            }

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
                    // セルの値をトリムして改行を削除
                    result[key] = (dataValues[index] || '').trim();
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
