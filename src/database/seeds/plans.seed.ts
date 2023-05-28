export const records = [
    {
        record: {
            icon: "/pricing/basic-g.png",
            name: "پایه",
            desc: "برای اشخاص و رستوران / کافی شاپ های کوچک",
            limitations: [
                { limit: "qr-scan-limit", value: Infinity, valueType: "Number" },
                { limit: "category-limit", value: Infinity, valueType: "Number" },
                { limit: "menu-item-limit", value: Infinity, valueType: "Number" },
                { limit: "brand-details-in-menu", value: true, valueType: "Boolean" },
                { limit: "multiple-language-limit", value: 2, valueType: "Number" },
                { limit: "ticket-and-support", value: true, valueType: "Boolean" },
                { limit: "menu-templates", value: false, valueType: "Boolean" },
                { limit: "branch-limit-count", value: 1, valueType: "Number" },
                { limit: "staff-limit-count", value: 5, valueType: "Number" },
                { limit: "customize-qr", value: false, valueType: "Boolean" },
                { limit: "restaurant-detailed-info", value: false, valueType: "Boolean" },
                { limit: "menu-item-like", value: false, valueType: "Boolean" },
                { limit: "analytics", value: false, valueType: "Boolean" },
                { limit: "item-highlighting", value: false, valueType: "Boolean" },
                { limit: "ordering-system", value: false, valueType: "Boolean" },
                { limit: "server-call-button", value: false, valueType: "Boolean" },
                { limit: "logo-in-qr", value: false, valueType: "Boolean" },
                { limit: "menu-item-coupling", value: false, valueType: "Boolean" },
                { limit: "menu-tag-option", value: false, valueType: "Boolean" },
                { limit: "customizable-category-logo", value: false, valueType: "Boolean" },
                { limit: "customer-review", value: false, valueType: "Boolean" },
            ],
            monthlyPrice: 0,
            halfYearPrice: 0,
            yearlyPrice: 0,
        },
        translation: { en: { name: "Basic", desc: "For individuals or small restaurants and small coffee shops" } },
    },
    {
        record: {
            icon: "/pricing/standard-g.png",
            name: "استاندارد",
            desc: "برای کسب و کار ها و رستوران هایی که بیش از یک شعبه دارند",
            limitations: [
                { limit: "qr-scan-limit", value: Infinity, valueType: "Number" },
                { limit: "category-limit", value: Infinity, valueType: "Number" },
                { limit: "menu-item-limit", value: Infinity, valueType: "Number" },
                { limit: "brand-details-in-menu", value: true, valueType: "Boolean" },
                { limit: "multiple-language-limit", value: 4, valueType: "Number" },
                { limit: "ticket-and-support", value: true, valueType: "Boolean" },
                { limit: "menu-templates", value: true, valueType: "Boolean" },
                { limit: "branch-limit-count", value: 5, valueType: "Number" },
                { limit: "staff-limit-count", value: 10, valueType: "Number" },
                { limit: "customize-qr", value: true, valueType: "Boolean" },
                { limit: "restaurant-detailed-info", value: true, valueType: "Boolean" },
                { limit: "menu-item-like", value: true, valueType: "Boolean" },
                { limit: "analytics", value: true, valueType: "Boolean" },
                { limit: "item-highlighting", value: true, valueType: "Boolean" },
                { limit: "ordering-system", value: false, valueType: "Boolean" },
                { limit: "server-call-button", value: false, valueType: "Boolean" },
                { limit: "logo-in-qr", value: false, valueType: "Boolean" },
                { limit: "menu-item-coupling", value: false, valueType: "Boolean" },
                { limit: "menu-tag-option", value: false, valueType: "Boolean" },
                { limit: "customizable-category-logo", value: false, valueType: "Boolean" },
                { limit: "customer-review", value: false, valueType: "Boolean" },
            ],
            monthlyPrice: 200_000,
            halfYearPrice: 1_200_000,
            yearlyPrice: 2_160_000,
        },
        translation: { en: { name: "Standard", desc: "For businesses and restaurants with more than one branch" } },
    },
    {
        record: {
            icon: "/pricing/pro-g.png",
            name: "حرفه ای",
            desc: "برای کسب و کارهایی که به بیش از یک منو دیجیتال نیاز دارند",
            limitations: [
                { limit: "qr-scan-limit", value: Infinity, valueType: "Number" },
                { limit: "category-limit", value: Infinity, valueType: "Number" },
                { limit: "menu-item-limit", value: Infinity, valueType: "Number" },
                { limit: "brand-details-in-menu", value: true, valueType: "Boolean" },
                { limit: "multiple-language-limit", value: 10, valueType: "Number" },
                { limit: "ticket-and-support", value: true, valueType: "Boolean" },
                { limit: "menu-templates", value: true, valueType: "Boolean" },
                { limit: "branch-limit-count", value: 15, valueType: "Number" },
                { limit: "staff-limit-count", value: 15, valueType: "Number" },
                { limit: "customize-qr", value: true, valueType: "Boolean" },
                { limit: "restaurant-detailed-info", value: true, valueType: "Boolean" },
                { limit: "menu-item-like", value: true, valueType: "Boolean" },
                { limit: "analytics", value: true, valueType: "Boolean" },
                { limit: "item-highlighting", value: true, valueType: "Boolean" },
                { limit: "ordering-system", value: true, valueType: "Boolean" },
                { limit: "server-call-button", value: true, valueType: "Boolean" },
                { limit: "logo-in-qr", value: true, valueType: "Boolean" },
                { limit: "menu-item-coupling", value: true, valueType: "Boolean" },
                { limit: "menu-tag-option", value: true, valueType: "Boolean" },
                { limit: "customizable-category-logo", value: true, valueType: "Boolean" },
                { limit: "customer-review", value: true, valueType: "Boolean" },
            ],
            monthlyPrice: 350_000,
            halfYearPrice: 2_100_000,
            yearlyPrice: 3_780_000,
        },
        translation: { en: { name: "Pro", desc: "For businesses that need more than a digital menu" } },
    },
];
