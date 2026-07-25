import path from 'path';
import fs from 'fs-extra';

/**
 * 将 srcDir 下的所有文件（包括子目录里的）复制到 destDir，
 * 只保留文件名，不保留子目录结构
 */
export async function copyFlatten(srcDir, destDir) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(srcDir, entry.name);

        if (entry.isDirectory()) {
            await copyFlatten(fullPath, destDir);
        } else if (entry.isFile()) {
            const targetPath = path.join(destDir, entry.name);
            if (fullPath === targetPath) {
                continue;
            }
            await fs.copy(fullPath, targetPath, { overwrite: true });
            console.log(`Copied: ${fullPath} → ${targetPath}`);
        }
    }
}