export const records = [
    // TODO : add desc to roles beside labels to descripe better what each permission does exacly

    // panels ----------------------------------
    {
        record: { _id: "main-panel", label: "دسترسی به پنل اصلی", desc: "", groupLabel: "پنل ها", group: "panels" },
        translation: { en: { label: "Access to main panel", desc: "", groupLabel: "Panels" } },
    },
    {
        record: { _id: "orders-panel", label: "دسترسی به پنل سفارشات", desc: "", groupLabel: "پنل ها", group: "panels" },
        translation: { en: { label: "Access to orders panel", desc: "", groupLabel: "Panels" } },
    },
    {
        record: { _id: "ordering-app", label: "دسترسی به اپ سفارش گیر", desc: "", groupLabel: "پنل ها", group: "panels" },
        translation: { en: { label: "Access to ordering app", desc: "", groupLabel: "Panels" } },
    },
    // ----------------------------------

    // dashboard ----------------------------------
    {
        record: {
            _id: "main-panel.dashboard.view",
            label: "مشاهده داشبورد",
            desc: "امکان مشاهده امار و اطلاعات کلی داخل صفحه داشبورد",
            groupLabel: "داشبورد",
            group: "dashboard",
        },
        translation: { en: { label: "View Dashboard", desc: "", groupLabel: "Dashboard" } },
    },
    // ----------------------------------

    // branches ----------------------------------
    {
        record: { _id: "main-panel.branches.view", label: "مشاهده شعبه ها", desc: "", groupLabel: "شعبه ها", group: "branches" },
        translation: { en: { label: "View Branches List", desc: "", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.add", label: "ایجاد شعبه جدید", desc: "", groupLabel: "شعبه ها", group: "branches" },
        translation: { en: { label: "Create New Branches", desc: "", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.edit", label: "ویرایش شعبه ها", desc: "", groupLabel: "شعبه ها", group: "branches" },
        translation: { en: { label: "Edit Branches", desc: "", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.delete", label: "حذف شعبه", desc: "", groupLabel: "شعبه ها", group: "branches" },
        translation: { en: { label: "Delete Branches", desc: "", groupLabel: "Branches" } },
    },
    // ----------------------------------

    // staff ----------------------------------
    {
        record: { _id: "main-panel.staff.view", label: "مشاهده اعضای خدمه", desc: "", groupLabel: "خدمه", group: "staff" },
        translation: { en: { label: "View Staff Member", desc: "", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.invite", label: "امکان ارسال دعوت", desc: "", groupLabel: "خدمه", group: "staff" },
        translation: { en: { label: "Invite Staff Member", desc: "", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.remove", label: "حذف اعضا خدمه", desc: "", groupLabel: "خدمه", group: "staff" },
        translation: { en: { label: "Remove Staff Member", desc: "", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.alter", label: "تغییر دسترسی اعضا", desc: "تغییر نقش اختصاص یافته به اعضا", groupLabel: "خدمه", group: "staff" },
        translation: { en: { label: "Alter Staff Member Roles", desc: "", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.roles", label: "مدیریت نقش های خدمه", desc: "ساخت و ویرایش نقش های خدمه", groupLabel: "خدمه", group: "staff" },
        translation: { en: { label: "Staff Roles", desc: "", groupLabel: "Staff" } },
    },
    // ----------------------------------

    // settings ----------------------------------
    {
        record: { _id: "main-panel.settings", label: "تغییر تنظیمات برند", desc: "امکان تغییر و ویرایش تنظیمات کلی برند", groupLabel: "تنظیمات", group: "settings" },
        translation: { en: { label: "Change brand settings", desc: "", groupLabel: "Settings" } },
    },
    // ----------------------------------

    // billing ----------------------------------
    {
        record: { _id: "main-main-panel.billing", label: "صورتحساب و ارتقا پلن", desc: "", groupLabel: "بخش مالی", group: "billing" },
        translation: { en: { label: "Billing and plan upgrade", desc: "", groupLabel: "Billing" } },
    },
    // ----------------------------------
];
