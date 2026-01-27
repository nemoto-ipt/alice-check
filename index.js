import main from './main.js';

// 設定
const classNameJson = {
	"注文番号": "#order-details-1 > div > div.rms-status-bar-wrapper > div.rms-status-bar.rms-status-inprogress > ul.pull-left > li:nth-child(1) > a",
	"注文日時": "#order-details-1 > div > div.rms-status-bar-wrapper > div.rms-status-bar.rms-status-inprogress > ul.pull-right > li > span:nth-child(2)",
	"名前": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-right-wrapper.col-sm-3.rms-clear-padding > div.rms-content-order-details-contact-info > div.rms-content-order-details-contact-info-names-wrapper > div.rms-content-order-details-contact-info-names > span.fullname",
	"注文内容": "#rms-content-order-details-block-destination-1-1 > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div > div.rms-row-wrapper > table > tbody > tr.opp-thick-border-green > td:nth-child(1) > div:nth-child(1) > a",
	"金額": "#rms-content-order-details-block-destination-1-1 > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div > div.rms-row-wrapper > table > tbody > tr:nth-child(3) > td:nth-child(3) > div:nth-child(1) > span",
	"クーポン": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-billing-details-wrapper > div:nth-child(2) > table > tbody > tr:nth-child(2) > td.text-right > span",
	"合計金額": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-billing-details-wrapper > div.rms-row-wrapper.ma-t-20 > table > tbody > tr:nth-child(1) > td.text-right > span",
	"支払い種別": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-main-wrapper.col-sm-12.rms-clear-padding > div.rms-content-order-details-block-left-wrapper.col-sm-9.rms-clear-padding > div.rms-content-order-details-summary-block-wrapper.col-sm-12.rms-clear-padding.rms-row-wrapper > div > div:nth-child(1) > div:nth-child(4) > div.rms-col-70-percent > p > span",
	"備考": "#order-details-form-1 > div.rms-content-order-details-block-form-note-block > pre",
	"ひとことメモ": "#orderDetailsFormMemoTextArea-1",
	// "支払い完了日": "",
	"注文確定日": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-history-wrapper.col-sm-12.rms-clear-padding > div > div.rms-col-33-percent > div.rms-content-order-details-block-history-table-wrapper.rms-col-100-percent > table > tbody > tr:nth-child(5) > td:nth-child(2)",
	// "依頼日": "",
	"配送日指定": {
		"selector": "#orderDetailsFormDeliveryDate",
		"type": "value"
	},
	// "時間指定": "#order-details-1 > div > div.rms-content-order-details-blocks > div.rms-content-order-details-block-form-wrapper.col-sm-12.rms-clear-padding > div > div.rms-content-order-details-block-right-wrapper.col-sm-3.rms-clear-padding > div > div > div:nth-child(4) > div",
	"置き配指定": "#rms-content-order-details-block-destination-1-1-options > div.rms-content-order-details-contact-info.col-sm-12.rms-clear-padding > div.rms-content-order-details-contact-info-contact-options > span.address-okihai",
	// "発送元": "",
	"発送日": {
		"selector": "#rms-content-order-details-block-destination-1-1-options-group-0-shipment-date",
		"type": "value"
	},
	// "納品予定日": "",
	"伝票番号": {
		"selector": "#rms-content-order-details-block-destination-1-1-options-group-0-parcel-number",
		"type": "value"
	},
	// "郵便番号": "",
	// "送付先住所": "",
	// "宛名": "",
	// "電話番号": "",
	// "": "",
};

// 実行
new main('html', classNameJson);