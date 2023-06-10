import { Schema } from "mongoose";

export const languages = {
    fa: "فارسی",
    en: "English",
    ar: "عربى",
    it: "Italiano",
    de: "Deutsch",
    fr: "Français",
    tr: "Türkçe",
    ja: "日本語 - Japanese",
    ko: "한국어 - Korean",
    cn: "普通话 - Chinese",
    hi: "हिन्दी - Hindi",
    es: "Español",
    ru: "Русский - Russian",
};

export interface Translation {
    fa?: any; // farsi
    en?: any; // english
    ar?: any; // arabic
    it?: any; // italian
    de?: any; // german
    fr?: any; // french
    tr?: any; // turkish
    ja?: any; // japanese
    ko?: any; // korean
    cn?: any; // chinese
    hi?: any; // hindi
    es?: any; // spanish
    ru?: any; // russian
}

export const TranslationSchema = new Schema({
    fa: { type: Object },
    en: { type: Object },
    ar: { type: Object },
    it: { type: Object },
    de: { type: Object },
    fr: { type: Object },
    tr: { type: Object },
    ja: { type: Object },
    ko: { type: Object },
    cn: { type: Object },
    hi: { type: Object },
    es: { type: Object },
    ru: { type: Object },
});
