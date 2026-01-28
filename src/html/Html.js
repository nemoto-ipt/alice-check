import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const htmlClass = {
	"注文No.": "#order-details-1 > div > div.rms-status-bar-wrapper > div.rms-status-bar.rms-status-inprogress > ul.pull-left > li:nth-child(1) > a",
	"注文日時": "#order-details-1 > div > div.rms-status-bar-wrapper > div.rms-status-bar.rms-status-inprogress > ul.pull-right > li > span:nth-child(2)",
	"お客様名": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-right-wrapper.col-sm-3.rms-clear-padding > div.rms-content-order-details-contact-info > div.rms-content-order-details-contact-info-names-wrapper > div.rms-content-order-details-contact-info-names > span.fullname",
	"注文内容": "#rms-content-order-details-block-destination-1-1 > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div > div.rms-row-wrapper > table > tbody > tr.opp-thick-border-green > td:nth-child(1) > div:nth-child(1) > a",
	"金額": "#rms-content-order-details-block-destination-1-1 > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div > div.rms-row-wrapper > table > tbody > tr:nth-child(3) > td:nth-child(3) > div:nth-child(1) > span",
	"クーポン利用": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-billing-details-wrapper > div:nth-child(2) > table > tbody > tr:nth-child(2) > td.text-right > span",
	"合計金額": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-billing-details-wrapper > div.rms-row-wrapper.ma-t-20 > table > tbody > tr:nth-child(1) > td.text-right > span",
	"支払種別": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-summary-block-wrapper.col-sm-12.rms-clear-padding.rms-row-wrapper > div > div:nth-child(1) > div:nth-child(4) > div.rms-col-70-percent > p > span",
	"備考": "#order-details-form-1 > div.rms-content-order-details-block-form-note-block > pre",
	"ひとことメモ": "#orderDetailsFormMemoTextArea-1",
	"支払完了日": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-history-wrapper.col-sm-12.rms-clear-padding > div > div.rms-col-33-percent > div.rms-content-order-details-block-history-table-wrapper.rms-col-100-percent > table > tbody > tr:nth-child(5) > td:nth-child(2)",
	"注文確定日": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-history-wrapper.col-sm-12.rms-clear-padding > div > div.rms-col-33-percent > div.rms-content-order-details-block-history-table-wrapper.rms-col-100-percent > table > tbody > tr:nth-child(5) > td:nth-child(2)",
	"依頼日　　　(情報工房⇒ｼﾝｶﾞﾎﾟｰﾙﾌｧｯｼｮﾝ)": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-history-wrapper.col-sm-12.rms-clear-padding > div > div.rms-col-66-percent > div:nth-child(3) > ul:nth-child(2) > li:nth-child(4) > div > span:nth-child(1)",
	"配送日指定": {
		"selector": "#orderDetailsFormDeliveryDate",
		"type": "value"
	},
	"時間指定": {
		"selector": ["#orderDetailsDeliveryTimeRangeStart-1", "#orderDetailsDeliveryTimeRangeEnd-1"],
		"type": "timeRange"
	},
	"置き配指定": "#rms-content-order-details-block-destination-1-1-options > div.rms-content-order-details-contact-info.col-sm-12.rms-clear-padding > div.rms-content-order-details-contact-info-contact-options > span.address-okihai",
	"発送元": "",
	"発送日": {
		"selector": "#rms-content-order-details-block-destination-1-1-options-group-0-shipment-date",
		"type": "value"
	},
	"納品予定日": "",
	"お荷物伝票番号": {
		"selector": "#rms-content-order-details-block-destination-1-1-options-group-0-parcel-number",
		"type": "value"
	},
	"送付先住所": "#rms-content-order-details-block-destination-1-1-options > div.rms-content-order-details-contact-info.col-sm-12.rms-clear-padding > div.rms-content-order-details-contact-info-contact-options > span.address",
	"送付先宛名": "#rms-content-order-details-block-destination-1-1-options > div.rms-content-order-details-contact-info.col-sm-12.rms-clear-padding > div.rms-content-order-details-contact-info-names-wrapper > div.rms-content-order-details-contact-info-names > span.fullname",
	"電話番号": "#rms-content-order-details-block-destination-1-1-options > div.rms-content-order-details-contact-info.col-sm-12.rms-clear-padding > div.rms-content-order-details-contact-info-contact-options > span.phone"
}



export default class HtmlDataExtractor {
    constructor(folderPath) {
        // 渡されたパスが絶寸パスかどうかを判定して処理
        this.targetDir = path.isAbsolute(folderPath) ? folderPath : path.resolve(folderPath);

        this.config = null;
        this.results = [];
        this.loadConfig();
    }

    // ここ直す
    loadConfig() {
        // htmlClass.json を読み込むか、デフォルト設定を使用
        let configPath;
        const possiblePaths = [
            // 通常のNode.js環境（モジュール相対）
            () => {
                try {
                    return path.join(path.dirname(new URL(import.meta.url).pathname), 'htmlClass.json');
                } catch {
                    return null;
                }
            },
            // EXEと同じディレクトリから
            () => path.join(path.dirname(process.execPath), 'src', 'html', 'htmlClass.json'),
            // プロセスのカレントディレクトリから
            () => path.join(process.cwd(), 'src', 'html', 'htmlClass.json'),
        ];
        
        for (const pathFn of possiblePaths) {
            try {
                const testPath = pathFn();
                if (testPath && fs.existsSync(testPath)) {
                    configPath = testPath;
                    if (process.platform === 'win32' && configPath.startsWith('\\')) {
                        configPath = configPath.substring(1);
                    }
                    break;
                }
            } catch (e) {
                // パスの取得に失敗した場合は次を試す
            }
        }
        
        try {
            if (configPath && fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                this.config = JSON.parse(configData);
            } else {
                // ファイルが見つからない場合はコードに埋め込まれた設定を使用
                this.config = htmlClass;
            }
            this.init();
        } catch (err) {
            console.error('設定ファイルの読み込み失敗:', err);
            // フォールバック：コード内の設定を使用
            this.config = htmlClass;
            this.init();
        }
    }

    init() {
        const filePaths = this.getHtmlFilePaths();
        if (filePaths.length === 0) {
            console.log('❌ 対象のHTMLファイルが見つかりませんでした。');
            return [];
        }

        filePaths.forEach(filePath => {
            const data = this.extractData(filePath);
            this.results.push(data);
        });

        return this.results;
    }

    getResults() {
        return this.results;
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
                    result[key] = `${startValue}:00-${endValue}:00`;
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
            const zipMatch = addressText.match(/〒?[\d\-]+/);
            
            if (zipMatch) {
                // 郵便番号を抽出（〒記号は除外）
                result['郵便番号'] = zipMatch[0].replace(/〒/, '');
                // 送付先住所から郵便番号を削除（先頭の郵便番号部分のみを削除）
                result['送付先住所'] = addressText.replace(/^〒?[\d\-]+\s*/, '').trim();
            }
        }

        return result;
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