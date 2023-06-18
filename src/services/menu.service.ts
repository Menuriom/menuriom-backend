import { Injectable } from "@nestjs/common";
import { unlink } from "fs/promises";
import { PlanLimitation } from "src/models/PlansLimitations.schema";

@Injectable()
export class MenuService {
    constructor() {}

    async removeCategoryCustomIcons(menuCategoryIcon: string): Promise<void> {
        if (menuCategoryIcon && menuCategoryIcon.includes("customCategoryIcons")) {
            unlink(menuCategoryIcon.replace("/file/", "storage/public/")).catch((e) => {});
        }
    }
}
