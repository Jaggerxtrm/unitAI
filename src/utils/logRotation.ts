import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

export class LogRotator {
  constructor(
    private logDir: string,
    private maxSizeMB: number = 10,
    private maxFiles: number = 5
  ) {}

  async rotate(filename: string): Promise<void> {
    const filePath = path.join(this.logDir, filename);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const stats = fs.statSync(filePath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB < this.maxSizeMB) {
      return;
    }

    await this.rotateFile(filePath);
  }

  private async rotateFile(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    const nameWithoutExt = basename.replace(/\.log$/, '');

    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${nameWithoutExt}.log.${i}.gz`);
      const newFile = path.join(dir, `${nameWithoutExt}.log.${i + 1}.gz`);

      if (fs.existsSync(oldFile)) {
        if (i + 1 > this.maxFiles) {
          fs.unlinkSync(oldFile);
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    const rotatedFile = path.join(dir, `${nameWithoutExt}.log.1.gz`);
    await this.compressFile(filePath, rotatedFile);

    fs.writeFileSync(filePath, '');
  }

  private async compressFile(sourcePath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const gzip = zlib.createGzip();
      const source = fs.createReadStream(sourcePath);
      const destination = fs.createWriteStream(destPath);

      source
        .pipe(gzip)
        .pipe(destination)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });
  }

  async rotateAll(): Promise<void> {
    if (!fs.existsSync(this.logDir)) {
      return;
    }

    const files = fs.readdirSync(this.logDir)
      .filter(f => f.endsWith('.log') && !f.includes('.log.'));

    for (const file of files) {
      try {
        await this.rotate(file);
      } catch (error) {
        console.error(`Failed to rotate ${file}:`, error);
      }
    }
  }
}

export function startAutoRotation(
  logDir: string,
  intervalMs: number = 3600000
): NodeJS.Timeout {
  const rotator = new LogRotator(logDir);
  
  return setInterval(async () => {
    try {
      await rotator.rotateAll();
    } catch (error) {
      console.error('Auto-rotation failed:', error);
    }
  }, intervalMs);
}
