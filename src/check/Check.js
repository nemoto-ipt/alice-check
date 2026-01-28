import fs from 'fs/promises';
import path from 'path';

function normalizeForCompare(s) {
    if (s == null) return '';
    return s.replace(/\s+/g, ' ').trim();
}

export default class Checker {
    constructor(basePath, excelMap = new Map(), htmlMap = new Map()) {
        this.basePath = basePath;
        this.excel = excelMap;
        this.html = htmlMap;
    }

    compare() {
        const rows = [];
        const usedHtml = new Set();

        for (const [key, excelText] of this.excel.entries()) {
            const htmlText = this.html.get(key);
            const a = normalizeForCompare(excelText);
            const b = normalizeForCompare(htmlText);
            const same = a === b;
            rows.push({ name: key, excel: a, html: b, same });
            if (htmlText != null) usedHtml.add(key);
        }

        for (const [key, htmlText] of this.html.entries()) {
            if (usedHtml.has(key)) continue;
            const a = '';
            const b = normalizeForCompare(htmlText);
            rows.push({ name: key, excel: a, html: b, same: a === b });
        }

        return rows;
    }

    async writeResult(rows) {
        const outDir = path.join(this.basePath, 'result');
        try {
            await fs.mkdir(outDir, { recursive: true });
        } catch (e) { }

        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const outPath = path.join(outDir, `result_${ts}.txt`);

        const lines = [];
        lines.push('Name\tExcel\tHTML\tSame');
        for (const r of rows) {
            const excelSafe = r.excel.replace(/\t/g, ' ').replace(/\n/g, ' ');
            const htmlSafe = r.html.replace(/\t/g, ' ').replace(/\n/g, ' ');
            lines.push(`${r.name}\t${excelSafe}\t${htmlSafe}\t${r.same ? 'Y' : 'N'}`);
        }

        await fs.writeFile(outPath, lines.join('\n'), 'utf8');
        return outPath;
    }
}
