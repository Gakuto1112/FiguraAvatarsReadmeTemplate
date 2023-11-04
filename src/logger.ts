/**
 * 警告メッセージを出力する。
 * @param message 表示するメッセージ
 */
export function warn(message: string): void {
    console.warn(`Warn: ${message}`);
}

/**
 * エラーメッセージを出力する。
 * @param message 表示するメッセージ
 */
export function error(message: string): void {
    console.error(`Error: ${message}`);
}