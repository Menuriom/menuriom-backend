import { Schema } from "mongoose";

export interface Translation {
    fa: unknown;
    en: unknown;
    it: unknown;
    de: unknown;
    tr: unknown;
    jp: unknown;
    cn: unknown;
}

export const TranslationSchema = new Schema({
    fa: { type: Object },
    en: { type: Object },
    it: { type: Object },
    de: { type: Object },
    tr: { type: Object },
    jp: { type: Object },
    cn: { type: Object },
});
