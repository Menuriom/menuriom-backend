import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import * as sharp from "sharp";
import { randomUUID } from "crypto";
import { I18nContext } from "nestjs-i18n";

@Injectable()
export class FileService {
    constructor() {}

    async saveUploadedImages(
        files: Express.Multer.File[],
        property: string,
        maxSize: number,
        Mimes: string[],
        maxWidth: number,
        storageType: "public" | "private",
        path: string,
    ): Promise<string[]> {
        // validate all files size and formats
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            // check file size
            if (file.size > maxSize) {
                throw new UnprocessableEntityException([
                    {
                        index: i,
                        property: property,
                        errors: [I18nContext.current().t("file.sizeError", { args: { size: maxSize / 1_048_576 } })],
                    },
                ]);
            }
            // check file format
            if (!Mimes.includes(extension)) {
                throw new UnprocessableEntityException([
                    {
                        index: i,
                        property: property,
                        errors: [I18nContext.current().t("userPanel.formatError")],
                    },
                ]);
            }
        }

        // save files to disc
        const fileLinks = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            const randName = randomUUID();

            const img = sharp(file.buffer);
            const imgMetadata = await img.metadata();
            if (imgMetadata.width > maxWidth) img.resize(maxWidth);
            const url = `storage/${storageType}${path}/${randName}.${extension}`;
            await img.toFile(url).catch((e) => console.log(e));
            fileLinks.push(url.replace(`storage/${storageType}/`, "/file/"));
        }

        return fileLinks;
    }
}
