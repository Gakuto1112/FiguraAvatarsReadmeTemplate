import fs from "fs";
import readline from "readline";
import { warn } from "./logger";

class ReadmeGenerator {
    /**
     * 対象のレポジトリ名
     */
    private readonly REPOSITORY_NAME: string;

    /**
     * fetchして入手したマークダウンのキャッシュ
     */
    private readonly caches: {[key: string]: string} = {};

    /**
     * コンストラクタ
     * @param repositoryName 対象のレポジトリ名
     * @param branchName 対象のブランチ名
     */
    constructor(repositoryName: string) {
        this.REPOSITORY_NAME = repositoryName;
    }

    /**
     * READMEをテンプレートから生成する。
     * @param inputPath 入力するテンプレートのパス
     * @param outputPath 生成するREADMEの出力先のパス
     */
    private async generateReadme(inputPath: string, outputPath: string): Promise<void> {
        const writeStream: fs.WriteStream = fs.createWriteStream(outputPath, {encoding: "utf-8"});
        for await (let line of readline.createInterface({input: fs.createReadStream(inputPath, {encoding: "utf-8"}), output: writeStream})) {
            //画像のソースファイルの置き換え
            line = line.replace(/\.\.\/README_images\//g, "./README_images/");

            //テンプレートを挿入
            const injectTags: IterableIterator<RegExpMatchArray> = line.matchAll(/<!-- \$inject\(([^\\\/:*?"><|]+)\) -->/g);
            let charCount: number = 0;
            for(const injectTag of injectTags) {
                writeStream.write(line.substring(charCount, injectTag.index));
                charCount += (injectTag.index as number) + injectTag[0].length;
                const fileName: string = (inputPath.match(/([^\\\/:*?"><|]+)\.md/) as RegExpMatchArray)[1];
                if(this.caches[`${injectTag[1]}_${fileName}`] != undefined) writeStream.write(this.caches[`${injectTag[1]}_${fileName}`]);
                else {
                    if(!fs.existsSync(`./templates/${injectTag[1]}`)) {
                        warn(`Unknown inject tag "${injectTag[1]}". This inject tag was skipped.`);
                        writeStream.write(`<!-- ERROR: Unknown inject tag "${injectTag[1]}" -->`);
                        continue;
                    }
                    else if(!fs.existsSync(`./templates/${injectTag[1]}/${fileName}.md`)) {
                        warn(`"${injectTag[1]}/${fileName}.md" doesn't exist. This inject tag was skipped.`);
                        writeStream.write(`<!-- ERROR: "${injectTag[1]}/${fileName}.md" doesn't exist -->`);
                        continue;
                    }
                    else {
                        let text: string = fs.readFileSync(`./templates/${injectTag[1]}/${fileName}.md`, {encoding: "utf-8"});
                        //プレースホルダの置き換え
                        text = text.replace(/<!--\s\$REPOSITORY_NAME\s-->/g, this.REPOSITORY_NAME);
                        writeStream.write(text);
                        this.caches[`${injectTag[1]}_${fileName}`] = text;
                    }
                }
            }
            writeStream.write(`${line.substring(charCount)}\n`);
        }
    }

    /**
     * メイン関数
     */
    public async main(): Promise<void> {
        console.info("Generating README.md...");
        await this.generateReadme(`${process.argv[2]}/README_templates/en.md`, `${process.argv[2]}/README.md`);
        console.info("Generating README_jp.md...");
        await this.generateReadme(`${process.argv[2]}/README_templates/jp.md`, `${process.argv[2]}/README_jp.md`);
    }
}

if(require.main === module) {
    new ReadmeGenerator(process.argv[3]).main();
}