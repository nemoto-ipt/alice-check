const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * 1. フォルダ内のHTMLファイルパスをすべて取得する
 */
function getHtmlFilePaths(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files
      .filter(file => path.extname(file).toLowerCase() === '.html')
      .map(file => path.join(dirPath, file));
  } catch (err) {
    console.error('ディレクトリの読み込みに失敗しました:', err);
    return [];
  }
}

/**
 * 2. 渡されたHTMLファイルを解析し、設定に基づいたデータを返す
 */
function extractDataFromHtml(filePath, configJson) {
  const content = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(content);
  const result = {};

  Object.keys(configJson).forEach(key => {
    const className = configJson[key].trim();
    // クラス名で抽出してオブジェクトに格納
    result[key] = $(`.${className}`).text().trim();
  });

  return result;
}

/**
 * 3. メイン処理：各機能を呼び出して表示する
 */
async function main() {
  const targetDir = path.join(__dirname, 'html');
  const classNameJson = {
    "注文番号": "rms-status-order-nr",
    "フルネーム": "fullname",
    "注文内容": "rms-span-open-in-new",
  };

  // ファイルリストの取得
  const filePaths = getHtmlFilePaths(targetDir);

  if (filePaths.length === 0) {
    console.log('対象のHTMLファイルが見つかりませんでした。');
    return;
  }

  // 各ファイルの解析と表示
  filePaths.forEach(filePath => {
    const data = extractDataFromHtml(filePath, classNameJson);
    
    // console.log(`【解析完了】: ${path.basename(filePath)}`);
    console.table(data); // テーブル形式で見やすく表示
    // console.log('-------------------------------------------');
  });
}

// 実行
main();