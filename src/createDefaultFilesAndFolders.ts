import { mkdir, writeFile } from "fs/promises";

const createContactInfoJSON = async () => {
    const filename = "contact_info.json";
    const structure = {
        email: "",
        socials: { telegram: "", linkedin: "", instagram: "" },
    };
    await writeFile(`./static/${filename}`, JSON.stringify(structure), { flag: "wx" }).catch((e) => console.log(e));
};

const createTermsAndConditionsJSON = async () => {
    const filename = "terms_and_conditions.json";
    const structure = { text: "" };
    await writeFile(`./static/${filename}`, JSON.stringify(structure), { flag: "wx" }).catch((e) => console.log(e));
};

export default async () => {
    const staticFolderList = [
        // ...
        "static",
        "storage",
        "storage/public",
        "storage/private",
        "storage/public/logos",
        "storage/public/gallery",
    ];
    for (let i = 0; i < staticFolderList.length; i++) await mkdir(`./${staticFolderList[i]}`, { recursive: true }).catch((e) => console.log(e));

    await Promise.all([
        // ...
        createContactInfoJSON(),
        createTermsAndConditionsJSON(),
    ]);
};
