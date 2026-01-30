import HtmlDataExtractor from './html/Html.js';
import ExcelReader from './excel/Excel.js';
import Checker from './check/Check.js';

export default class Main {
    constructor(htmlFolderPath, excelFolderPath) {
        this.htmlFolderPath = htmlFolderPath;
        this.excelFolderPath = excelFolderPath;

        return this.init();
    }

    async init() {
        // HTMLデータを取得
        const htmlExtractor = new HtmlDataExtractor(this.htmlFolderPath);
        const htmlData = htmlExtractor.getResults();

        // Excelデータを取得
        const excelReader = new ExcelReader(this.excelFolderPath);
        const excelData = excelReader.getResults();

        // 比較実行（プロジェクトルートをbasePath として渡す）
        const baseDir = process.cwd();
        const checker = new Checker(baseDir);
        checker.setHtmlData(htmlData);
        checker.setExcelData(excelData);

        const compareResults = checker.compare();
        
        // CSV出力
        await checker.writeResult(compareResults);

        // TXT出力
        // await checker.writeTxtResult(compareResults);
    }
}
