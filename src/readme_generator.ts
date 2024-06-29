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
     * インジェクトタグ（<!--- $inject(<tag_name>) ->）が見つかった時に呼ばれる関数
     * @param tagName タグの名前
     * @param inputPath 入力するテンプレートのパス
     * @returns タグに置き換わる文字列。返された文字列がREADMEに挿入される。
     */
    private onInjectTagFound(tagName: string, inputPath: string): string {
        const fileName: string = (inputPath.match(/([^\\\/:*?"><|]+)\.md/) as RegExpMatchArray)[1];
        if(this.caches[`${tagName}_${fileName}`] != undefined) return this.caches[`${tagName}_${fileName}`];
        else {
            if(!fs.existsSync(`./templates/${tagName}`)) {
                warn(`Unknown inject tag "${tagName}". This inject tag was skipped.`);
                return `<!-- ERROR: Unknown inject tag "${tagName}" -->`;
            }
            else if(!fs.existsSync(`./templates/${tagName}/${fileName}.md`)) {
                warn(`"${tagName}/${fileName}.md" doesn't exist. This inject tag was skipped.`);
                return `<!-- ERROR: "${tagName}/${fileName}.md" doesn't exist -->`;
            }
            else {
                let text: string = fs.readFileSync(`./templates/${tagName}/${fileName}.md`, {encoding: "utf-8"});
                //プレースホルダの置き換え
                text = text.replace(/<!--\s\$REPOSITORY_NAME\s-->/g, this.REPOSITORY_NAME);
                this.caches[`${tagName}_${fileName}`] = text;
                return text;
            }
        }
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
                writeStream.write(this.onInjectTagFound(injectTag[1], inputPath));
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