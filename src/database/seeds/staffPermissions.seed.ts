export const records = [
    // TODO : add desc to roles beside labels to descripe better what each permission does exacly

    // panels ----------------------------------
    {
        record: { _id: "main-panel", label: "دسترسی به پنل اصلی", group: "panels", groupLabel: "پنل ها" },
        translation: { en: { label: "Access to main panel", groupLabel: "Panels" } },
    },
    {
        record: { _id: "orders-panel", label: "دسترسی به پنل سفارشات", group: "panels", groupLabel: "پنل ها" },
        translation: { en: { label: "Access to orders panel", groupLabel: "Panels" } },
    },
    {
        record: { _id: "ordering-app", label: "دسترسی به اپ سفارش گیر", group: "panels", groupLabel: "پنل ها" },
        translation: { en: { label: "Access to ordering app", groupLabel: "Panels" } },
    },
    // ----------------------------------

    // dashboard ----------------------------------
    {
        record: { _id: "main-panel.dashboard.view", label: "مشاهده داشبورد", group: "dashboard", groupLabel: "داشبورد" },
        translation: { en: { label: "View Dashboard", groupLabel: "Dashboard" } },
    },
    // ----------------------------------

    // branches ----------------------------------
    {
        record: { _id: "main-panel.branches.view", label: "مشاهده لیست شعبه ها", group: "branches", groupLabel: "شعبه ها" },
        translation: { en: { label: "View Branches List", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.add", label: "ایجاد شعبه جدید", group: "branches", groupLabel: "شعبه ها" },
        translation: { en: { label: "Create New Branches", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.edit", label: "ویرایش شعبه ها", group: "branches", groupLabel: "شعبه ها" },
        translation: { en: { label: "Edit Branches", groupLabel: "Branches" } },
    },
    {
        record: { _id: "main-panel.branches.delete", label: "حذف شعبه", group: "branches", groupLabel: "شعبه ها" },
        translation: { en: { label: "Delete Branches", groupLabel: "Branches" } },
    },
    // ----------------------------------

    // staff ----------------------------------
    {
        record: { _id: "main-panel.staff.view", label: "مشاهده اعضای خدمه", group: "staff", groupLabel: "خدمه" },
        translation: { en: { label: "View Staff Member", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.invite", label: "امکان ارسال دعوت", group: "staff", groupLabel: "خدمه" },
        translation: { en: { label: "Invite Staff Member", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.remove", label: "حذف اعضا خدمه", group: "staff", groupLabel: "خدمه" },
        translation: { en: { label: "Remove Staff Member", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.alter", label: "تغییر دسترسی اعضا", group: "staff", groupLabel: "خدمه" },
        translation: { en: { label: "Alter Staff Member Roles", groupLabel: "Staff" } },
    },
    {
        record: { _id: "main-panel.staff.roles", label: "مدیریت نقش های خدمه", group: "staff", groupLabel: "خدمه" },
        translation: { en: { label: "Staff Roles", groupLabel: "Staff" } },
    },
    // ----------------------------------

    // settings ----------------------------------
    {
        record: { _id: "main-panel.settings", label: "تغییر تنظیمات برند", group: "settings", groupLabel: "تنظیمات" },
        translation: { en: { label: "Change brand settings", groupLabel: "Settings" } },
    },
    // ----------------------------------

    // billing ----------------------------------
    {
        record: { _id: "main-main-panel.billing", label: "صورتحساب و ارتقا پلن", group: "billing", groupLabel: "بخش مالی" },
        translation: { en: { label: "Billing and plan upgrade", groupLabel: "Billing" } },
    },
    // ----------------------------------
];
