import HtmlDataExtractor from './html/Html.js';

export default class Main {
    constructor(htmlFolderPath) {
        this.htmlFolderPath = htmlFolderPath;
        this.init();
    }

    init() {
        // HtmlDataExtractor を初期化して実行
        new HtmlDataExtractor(this.htmlFolderPath);
    }

}