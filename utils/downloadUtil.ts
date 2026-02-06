import fs from 'fs';
import path from 'path';
import { Page, Download } from '@playwright/test';

export class DownloadUtil {
  private static readonly DOWNLOAD_DIR = path.resolve(process.cwd(), 'downloads');

  /**
   * Ensure download directory exists
   */
  private static ensureDownloadDir(): void {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Download file and save to /downloads
   * @returns The full path where the file was saved
   */
  static async downloadFile(
    page: Page,
    triggerAction: () => Promise<void>,
    timeout: number = 30000 // Add timeout parameter
  ): Promise<string> {
    this.ensureDownloadDir();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout }), // Add timeout
      triggerAction(),
    ]);

    const fileName = download.suggestedFilename();
    const filePath = path.join(this.DOWNLOAD_DIR, fileName);
    
    // Save the file
    await download.saveAs(filePath);
    
    // Verify file was actually saved
    if (!fs.existsSync(filePath)) {
      throw new Error(`File was not saved to ${filePath}`);
    }

    return filePath;
  }

  /**
   * Delete downloaded file
   */
  static deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.log(`File not found, cannot delete: ${filePath}`);
    }
  }

  /**
   * Delete all downloads
   */
  static clearDownloads(): void {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) return;
    
    const files = fs.readdirSync(this.DOWNLOAD_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(this.DOWNLOAD_DIR, file));
    });
    
    console.log(`Cleared ${files.length} file(s) from downloads directory`);
  }

  /**
   * Check if file exists and has content
   */
  static verifyDownload(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const stats = fs.statSync(filePath);
    return stats.size > 0;
  }
}