import fs from "fs";
import readline from "readline";
import { error, warn } from "./logger";

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
    public async generateReadme(inputPath: string, outputPath: string): Promise<void> {
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
}

/**
 * メイン関数
 */
async function main(): Promise<void> {
    let errorFound: boolean = false;

    /**
     * コマンドライン引数を確認する。
     * @param argIndex 確認する引数のインデクス番号（1つ目の引数は0、2つ目の引数は1、...）
     * @param errorMessage 引数が指定されていない場合のエラーメッセージ
     * @returns 引数が指定されていればtrue、指定されていなければfalseを返す。
     */
    function checkArgs(argIndex: number, argName: string): boolean {
        if(process.argv[argIndex + 2] != undefined && process.argv[argIndex + 2].length > 0) return true;
        else {
            error(`Argument ${argIndex + 1} was expected to be the ${argName}, but not specified.`);
            errorFound = true;
            return false;
        }
    }

    //引数の確認
    //0. READMEのルートディレクトリ
    if(checkArgs(0, "readme root path")) {
        if(!fs.existsSync(process.argv[2])) {
            error(`"${process.argv[2]}" was specified as the readme root path, but it doesn't exist.`);
            errorFound = true;
        }
    }

    //1. READMEがあるレポジトリ名
    if(checkArgs(1, "repository name")) {
        if(!/^[a-z0-9](?:-(?=[a-z0-9])|[a-z0-9]){0,38}(?<=[a-z0-9])\/[\w\-\.]+$/i.test(process.argv[3])) {
            error(`"${process.argv[3]}" was specified as the repository name, but it is invalid.`);
            errorFound = true;
        }
    }

    if(!errorFound) {
        const readmeGenerator: ReadmeGenerator = new ReadmeGenerator(process.argv[3]);
        console.info("Generating README.md...");
        await readmeGenerator.generateReadme(`${process.argv[2]}/README_templates/en.md`, `${process.argv[2]}/README.md`);
        console.info("Generating README_jp.md...");
        await readmeGenerator.generateReadme(`${process.argv[2]}/README_templates/jp.md`, `${process.argv[2]}/README_jp.md`);
    }
    else process.exit(1);
}

main();