import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export default class HtmlDataExtractor {
    constructor(folderPath, config) {
        // 渡されたパスが絶対パスかどうかを判定して処理
        this.targetDir = path.isAbsolute(folderPath) ? folderPath : path.resolve(folderPath);

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

            // typeに応じて取得方法を変更
            if (type === 'value') {
                const element = $(selector).first();
                result[key] = element.val() || element.attr('value') || '';
            } else if (type === 'timeRange') {
                // 時間指定：複数のセレクタから値を取得して範囲形式にする
                const startElement = $(selector[0]).first();
                const endElement = $(selector[1]).first();
                const startValue = startElement.val() || '';
                const endValue = endElement.val() || '';
                
                if (startValue && endValue) {
                    result[key] = `${startValue}:00~${endValue}:00`;
                } else {
                    result[key] = '';
                }
            } else {
                const element = $(selector).first();
                result[key] = element.text().replace(/\s+/g, ' ').trim();
            }
        });

        // 注文日時を注文日と注文時間に分割
        if (result['注文日時']) {
            const parts = result['注文日時'].split(' ');
            if (parts.length >= 2) {
                result['注文日'] = parts[0];
                result['注文時間'] = parts[1];
            } else {
                result['注文日'] = parts[0] || '';
                result['注文時間'] = '';
            }
            delete result['注文日時'];
        }

        // 金額から「円」を削除
        if (result['金額']) {
            result['金額'] = result['金額'].replace(/円/g, '').trim();
        }
        
        // クーポン利用から「円」を削除、マイナス記号を▲に置き換え
        if (result['クーポン利用']) {
            result['クーポン利用'] = result['クーポン利用']
                .replace(/円/g, '')
                .replace(/-/g, '▲')
                .trim();
        }
        
        // 合計金額から「円」を削除
        if (result['合計金額']) {
            result['合計金額'] = result['合計金額'].replace(/円/g, '').trim();
        }
        
        // 日付から時間を削除（日付部分のみを抽出）
        const dateFields = ['支払完了日', '注文確定日', '依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)'];
        dateFields.forEach(field => {
            if (result[field]) {
                const datePart = result[field].split(' ')[0];
                result[field] = datePart;
            }
        });

        // 置き配指定から「置き配場所：」を削除
        if (result['置き配指定']) {
            result['置き配指定'] = result['置き配指定'].replace(/置き配場所[：:]/g, '').trim();
        }

        // 送付先住所から郵便番号を抽出して削除
        if (result['送付先住所']) {
            const addressText = result['送付先住所'];
            const zipMatch = addressText.match(/〒?([\d\-]+)/);
            
            if (zipMatch) {
                // 郵便番号を抽出（〒記号は除外）
                result['郵便番号'] = zipMatch[1];
                // 送付先住所から郵便番号を削除
                result['送付先住所'] = addressText.replace(/〒?[\d\-]+\s*/g, '').trim();
            }
        }

        return result;
    }

    displayResults() {
        // fileNameを除外して出力
        const resultsWithoutFileName = this.results.map(item => {
            const { fileName, ...rest } = item;
            return rest;
        });
        console.log(JSON.stringify(resultsWithoutFileName, null, 2));
    }
}









const htmlResult =   {
    "注文No.": "",
    "注文日": "",
    "注文時間": "",
    "お客様名": "",
    "品番": "",
    "髪飾り種別": "",
    "カラー": "",
    "金額": "",
    "クーポン利用": "",
    "合計金額": ", ",
    "支払種別": "",
    "支払完了日": "",
    "注文確定日": "",
    "依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)": "",
    "配送日指定": "",
    "時間指定": "",
    "置き配指定": "",
    "発送元": "",
    "発送日": "",
    "納品予定日": "",
    "お荷物伝票番号": "",
    "郵便番号": "",
    "送付先住所": "",     
    "送付先宛名": "",
    "電話番号": "",
    "キャンセル": "",
    "備考": ""
  }