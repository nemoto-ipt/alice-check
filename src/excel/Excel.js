import fs from 'fs/promises';
import path from 'path';

export default class ExcelReader {
    constructor(basePath) {
        this.basePath = basePath;
        this.dir = path.join(basePath, 'excel');
    }

    async readAll() {
        const out = new Map();
        let entries = [];
        try {
            entries = await fs.readdir(this.dir, { withFileTypes: true });
        } catch (e) {
            return out; // no excel folder or unreadable
        }

        for (const ent of entries) {
            if (!ent.isFile()) continue;
            const name = ent.name;
            if (!name.toLowerCase().endsWith('.txt')) continue;
            const full = path.join(this.dir, name);
            try {
                const raw = await fs.readFile(full, 'utf8');
                const normalized = raw.replace(/\r\n/g, '\n').trim();
                const key = path.basename(name, '.txt');
                out.set(key, normalized);
            } catch (e) {
                // skip unreadable file
            }
        }

        return out;
    }
}
