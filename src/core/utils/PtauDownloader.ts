import fs from "fs";
import path from "path";

import { HardhatZKitError } from "../../errors";
import { MAX_PTAU_ID, PTAU_FILES_URL_PREFIX } from "../../constants";
import { Reporter } from "../../reporter";
import { downloadFile } from "../../utils/utils";

export class PtauDownloader {
  public static async downloadPtau(ptauDirFullPath: string, ptauId: number): Promise<string> {
    if (ptauId > MAX_PTAU_ID) {
      throw new HardhatZKitError(
        `Circuits has too many constraints. The maximum ptauId to download is ${this.getMaxPtauID()}. Consider passing "ptauDir=PATH_TO_LOCAL_DIR" with existing ptau files.`,
      );
    }

    const ptauFileName: string = `powers-of-tau-${ptauId}.ptau`;

    const ptauFilePath = path.join(ptauDirFullPath, ptauFileName);
    const url = this.getDownloadURL(ptauId);

    fs.mkdirSync(ptauDirFullPath, { recursive: true });

    Reporter!.reportPtauFileDownloadingInfo(ptauFilePath, url);

    if (
      !(await downloadFile(
        ptauFilePath,
        url,
        () => Reporter!.reportPtauFileDownloadingFinish(),
        () => Reporter!.reportPtauFileDownloadingError(),
      ))
    ) {
      throw new HardhatZKitError(`Failed to download a Ptau file. Please try again or download manually.`);
    }

    return ptauFilePath;
  }

  public static getDownloadURL(ptauId: number): string {
    return `${PTAU_FILES_URL_PREFIX}${ptauId.toString().padStart(2, "0")}.ptau`;
  }

  public static getMaxPtauID(): number {
    return MAX_PTAU_ID;
  }
}
