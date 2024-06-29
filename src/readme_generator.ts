import fs from "fs";
import readline from "readline";

/**
 * READMEドキュメントの言語を示す列挙型
 */
export type FileLanguage = "en" | "jp";

/**
 * READMEの生成クラス
 */
export class ReadmeGenerator {
    /**
     * 対象のレポジトリ名
     */
    protected readonly RepositoryName: string;

    /**
     * テンプレートレポジトリまでのルートパス
     */
    private readonly rootPath: string;

    /**
     * fetchして入手したマークダウンのキャッシュ
     */
    protected readonly caches: {[key: string]: string} = {};

    /**
     * コンストラクタ
     * @param repositoryName 対象のレポジトリ名
     * @param rootPath テンプレートレポジトリまでのルートパス
     */
    constructor(repositoryName: string, rootPath: string) {
        this.RepositoryName = repositoryName;
        this.rootPath = rootPath
    }

    /**
     * インジェクトタグ（<!--- $inject(<tag_name>) ->）が見つかった時に呼ばれる関数
     * @param tagName タグの名前
     * @param fileLanguage READMEドキュメントの言語
     * @returns タグに置き換わる文字列。返された文字列がREADMEに挿入される。
     */
    protected onInjectTagFound(tagName: string, fileLanguage: FileLanguage): string {
        if(this.caches[`${tagName}_${fileLanguage}`] != undefined) return this.caches[`${tagName}_${fileLanguage}`];
        else {
            if(!fs.existsSync(`${this.rootPath}/templates/${tagName}`)) return `<!-- ERROR: Unknown inject tag "${tagName}" -->`;
            else if(!fs.existsSync(`${this.rootPath}/templates/${tagName}/${fileLanguage}.md`)) return `<!-- ERROR: "${tagName}/${fileLanguage}.md" doesn't exist -->`;
            else {
                let text: string = fs.readFileSync(`${this.rootPath}/templates/${tagName}/${fileLanguage}.md`, {encoding: "utf-8"});
                //プレースホルダの置き換え
                text = text.replace(/<!--\s\$REPOSITORY_NAME\s-->/g, this.RepositoryName);
                this.caches[`${tagName}_${fileLanguage}`] = text;
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
                charCount += injectTag.index! + injectTag[0].length;
                writeStream.write(this.onInjectTagFound(injectTag[1], inputPath.match(/([^\\\/:*?"><|]+)\.md/)![1] as FileLanguage));
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
    new ReadmeGenerator(process.argv[3], ".").main();
}