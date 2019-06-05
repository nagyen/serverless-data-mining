import * as fs from 'fs';
import { dictionary } from './parser-dictionary';

export class Parser {

    public parse(lines: string[]) {

        // save prepared file text (for debug)
        // fs.writeFile('./parsed/lines.json', JSON.stringify(lines, null, 4), (err) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log('JSON saved to lines.json');
        //     }
        // });

        // 1 parse regulars
        return this.parseDictionaryRegular(lines);

        // for (let i = 0; i < rows.length; i++) {
        //     row = rows[i];

        //     // 2 parse profiles
        //     // row = rows[i] = parseDictionaryProfiles(row, Resume);
        //     // 3 parse titles
        //     parseDictionaryTitles(Resume, rows, i);
        //     parseDictionaryInline(Resume, row);
        // }
    }

    public parseDictionaryRegular(data) {
        const regularDictionary = dictionary.regular;
        const resume = {};
        Object.entries(regularDictionary).forEach(([key, expressions]) => {
            expressions.forEach((expression) => {
                const find = new RegExp(expression).exec(data);
                if (find) {
                    resume[key.toLowerCase()] = find[0];
                }
            });
        });
        return resume;
    }
}
