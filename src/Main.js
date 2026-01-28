import HtmlDataExtractor from './html/Html.js';
import ExcelReader from './excel/Excel.js';
import Checker from './check/Check.js';

export default class Main {
    constructor(htmlFolderPath, excelFolderPath) {
        this.htmlFolderPath = htmlFolderPath;
        this.excelFolderPath = excelFolderPath;

        this.init();
    }

    init() {
        // new HtmlDataExtractor(this.htmlFolderPath);
        new ExcelReader(this.excelFolderPath);

        // new Checker(this.htmlFolderPath, this.excelFolderPath);

    }
}
