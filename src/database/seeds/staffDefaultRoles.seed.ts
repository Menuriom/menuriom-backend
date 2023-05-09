export const records = [
    // TODO : add desc to roles beside labels to descripe better what each permission does exacly

    // admin ----------------------------------
    {
        record: {
            name: "admin",
            permissions: [
                "main-panel",
                "orders-panel",
                "ordering-app",
                "main-panel.dashboard.view",
                "main-panel.branches.view",
                "main-panel.branches.add",
                "main-panel.branches.edit",
                "main-panel.branches.delete",
                "main-panel.staff.view",
                "main-panel.staff.invite",
                "main-panel.staff.remove",
                "main-panel.staff.alter",
                "main-panel.staff.roles",
                "main-panel.settings",
                "main-main-panel.billing",
            ],
        },
        translation: { en: { name: "admin" }, fa: { name: "ادمین" } },
    },
    // ----------------------------------

    // manager ----------------------------------
    {
        record: {
            name: "manager",
            permissions: [
                "main-panel",
                "orders-panel",
                "ordering-app",
                "main-panel.dashboard.view",
                "main-panel.staff.view",
                "main-panel.staff.invite",
                "main-panel.staff.remove",
                "main-panel.staff.alter",
                "main-panel.staff.roles",
            ],
        },
        translation: { en: { name: "manager" }, fa: { name: "مدیر" } },
    },
    // ----------------------------------

    // waiter ----------------------------------
    {
        record: { name: "waiter", permissions: ["ordering-app"] },
        translation: { en: { name: "waiter" }, fa: { name: "گارسون" } },
    },
    // ----------------------------------

    // cashier ----------------------------------
    {
        record: { name: "cashier", permissions: ["orders-panel", "ordering-app"] },
        translation: { en: { name: "cashier" }, fa: { name: "صندوقدار" } },
    },
    // ----------------------------------
];
