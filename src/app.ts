import { Comprehend, Textract } from 'aws-sdk';
import * as fs from 'fs';
import { Parser } from './parser';
export class ParseResume {
    private textract: Textract;
    private comprehend: Comprehend;
    private parser: Parser;
    constructor() {
        this.textract = new Textract({
            region: 'us-east-1',
        });
        this.comprehend = new Comprehend({
            region: 'us-east-1',
        });
        this.parser = new Parser();

    }

    public async getLines(bucket: string, key: string) {
        const params: Textract.DetectDocumentTextRequest = {
            Document: { /* required */
                // Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
                S3Object: {
                    Bucket: bucket,
                    Name: key,
                },
            },
        };

        console.time('detect-text');
        const detectTextRes = await this.textract.detectDocumentText(params).promise();
        console.timeEnd('detect-text');

        // fs.writeFile('./parsed/resume-data.json', JSON.stringify(detectTextRes, null, 4), (err) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log('JSON saved to resume-data.json');
        //     }
        // });

        const lines = detectTextRes.Blocks.filter((x) => x.BlockType === 'LINE').map((x) => x.Text);
        const text = lines.join();
        // console.log(lines.join());

        // using regex
        // console.log('lines', lines);
        // const resume = this.parser.parse(lines);
        // console.log('resume', JSON.stringify(resume, null, 4));

        // NLP
        const comprehendParam: Comprehend.Types.DetectEntitiesRequest = {
            Text: text,
            LanguageCode: 'en',
        };
        const comprehendRes = await this.comprehend.detectEntities(comprehendParam).promise();

        // debug
        // fs.writeFile('./parsed/resume-entities.json', JSON.stringify(comprehendRes, null, 4), (err) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log('JSON saved to resume-entities.json');
        //     }
        // });

        const highConfidenceEntities = comprehendRes.Entities.filter((x) => x.Score > 0.85);
        const moderateConfidenceEntities = comprehendRes.Entities.filter((x) => x.Score > 0.75);
        const lowConfidenceEntities = comprehendRes.Entities.filter((x) => x.Score > 0.55);

        const resume = {} as any;
        resume.name = highConfidenceEntities.find((x) => x.Type === 'PERSON').Text;
        resume.address = highConfidenceEntities.find((x) => x.Type === 'LOCATION').Text;
        resume.contacts = highConfidenceEntities.filter((x) => x.Type === 'OTHER').map((x) => x.Text);
        resume.skills = [...new Set(moderateConfidenceEntities.filter((x) => x.Type === 'TITLE').map((x) => x.Text))];
        resume.organizations = [...new Set(lowConfidenceEntities.filter((x) => x.Type === 'ORGANIZATION').map((x) => x.Text))];
        console.log('resume', JSON.stringify(resume, null, 4));
    }

}
