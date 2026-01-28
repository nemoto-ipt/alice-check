import fs from 'fs';
import path from 'path';

// デフォルトヘッダー　エクセルからとる
//                          注文No.	注文日	注文時間	お客様名	品番	髪飾り種別	カラー	金額	クーポン利用	合計金額	支払種別	支払完了日	注文確定日	依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)	配送日指定	時間指定	置き配指定	発送元	発送日	納品予定日	お荷物伝票番号	郵便番号	送付先住所	送付先宛名	電話番号	キャンセル	備考
const DEFAULT_HEADERS = ['注文No.', '注文日', '注文時間', 'お客様名', '品番', '髪飾り種別', 'カラー', '金額', 'クーポン利用', '合計金額', '支払種別', '支払完了日', '注文確定日', '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)', '配送日指定', '時間指定', '置き配指定', '発送元', '発送日', '納品予定日', 'お荷物伝票番号', '郵便番号', '送付先住所', '送付先宛名', '電話番号', 'キャンセル', '備考'];

export default class ExcelReader {
    constructor(folderPath) {
        this.targetDir = path.isAbsolute(folderPath) ? folderPath : path.resolve(folderPath);
        this.excelFilePath = path.join(this.targetDir, 'excel.txt');
        this.init();
    }

    init() {
        try {
            // DEFAULT_HEADERSを使用
            const keys = DEFAULT_HEADERS;

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
