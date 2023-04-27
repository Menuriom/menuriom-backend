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
    fa?: unknown; // farsi
    en?: unknown; // english
    ar?: unknown; // arabic
    it?: unknown; // italian
    de?: unknown; // german
    fr?: unknown; // french
    tr?: unknown; // turkish
    ja?: unknown; // japanese
    ko?: unknown; // korean
    cn?: unknown; // chinese
    hi?: unknown; // hindi
    es?: unknown; // spanish
    ru?: unknown; // russian
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
