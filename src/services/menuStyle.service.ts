import { Injectable } from "@nestjs/common";
import { unlink } from "fs/promises";
import { PlanLimitation } from "src/models/PlansLimitations.schema";

@Injectable()
export class MenuStyleService {
    constructor() {}

    calculateShadowLevel(hexColor: string): string {
        const red = parseInt(hexColor.substring(0, 2), 16) / 255;
        const green = parseInt(hexColor.substring(2, 4), 16) / 255;
        const blue = parseInt(hexColor.substring(4, 6), 16) / 255;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        const lightness = (max + min) / 2;
        return lightness.toString();
    }
}
