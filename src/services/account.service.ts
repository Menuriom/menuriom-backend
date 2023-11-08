import { Injectable, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { FilterQuery, Model, Types } from "mongoose";
import { I18nContext } from "nestjs-i18n";
import { InjectModel } from "@nestjs/mongoose";
import { MenuSytleDocument } from "src/models/MenuStyles.schema";
import { WorkingHourDocument } from "src/models/WorkingHours.schema";

@Injectable()
export class AccountService {
    constructor(
        // ...
        @InjectModel("MenuStyle") private readonly MenuStyleModel: Model<MenuSytleDocument>,
        @InjectModel("WorkingHour") private readonly WorkingHourModel: Model<WorkingHourDocument>,
    ) {}

    async setupBaseMenuStyle(brandID: string) {
        await this.MenuStyleModel.updateOne(
            { brand: brandID },
            {
                $set: {
                    baseColors: {
                        textColor: "#ffffffFF",
                        bgMainColor: "#171717FF",
                        bgSecondaryColor: "#282828FF",
                        primaryColor: "#9c86b0ff",
                        accentColor: "#6b979eFF",
                    },
                    mainMenuStyleOptions: {
                        headerOptions: {
                            component: "Header2",
                            componentList: ["Header1", "Header2"],
                            textColor: "#ffffffFF",
                            bgMainColor: "#171717FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#9c86b0c8",
                            accentColor: "#649EAFFF",
                            withPattern: true,
                            bgImageMode: "list",
                            bgImage: "/patterns/pattern7.webp",
                            bgImageSize: "50",
                            bgImageOpacity: "20",
                            bgImageRotation: "0",
                            logoRadius: "35",
                        },
                        suggestionsOptions: {
                            component: "Suggestions1",
                            textColor: "#FCFCFDFF",
                            bgMainColor: "#303030FF",
                            bgSecondaryColor: "#404040FF",
                            accentColor: "#545d5fFF",
                            withPattern: false,
                            bgImageFile: null,
                            bgImageMode: "list",
                            bgImage: "",
                            bgImageSize: "30",
                            bgImageOpacity: "20",
                            bgImageRotation: "0",
                            cornerRadius: "10",
                        },
                        offerOptions: {
                            component: "Offers1",
                        },
                        searchOptions: {
                            component: "Search1",
                            textColor: "#ffffffFF",
                            bgMainColor: "#171717FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#C1AACEFF",
                            accentColor: "#649EAFFF",
                            active: true,
                        },
                        categoriesOptions: {
                            component: "Categories1",
                            textColor: "#ffffffFF",
                            bgMainColor: "#171717FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#9c86b0ff",
                            accentColor: "#649EAFFF",
                            orientation: "row",
                            orientations: ["row", "col"],
                            cornerRadius: "15",
                            withIcon: true,
                        },
                        itemHeaderOptions: {
                            component: "ItemHeader1",
                            componentList: ["ItemHeader1", "ItemHeader2"],
                            textColor: "#ffffffFF",
                            bgMainColor: "#171717FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#C1AACEFF",
                            accentColor: "#6b979eFF",
                            withIcon: true,
                            cornerRadius: "10",
                        },
                        itemListOptions: {
                            component: "ItemList3",
                            componentList: ["ItemList1", "ItemList2", "ItemList3"],
                            textColor: "#ffffffFF",
                            bgMainColor: "#292929FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#9c86b0ff",
                            accentColor: "#6b979eFF",
                            withPattern: false,
                            bgImageMode: "list",
                            bgImage: "/patterns/pattern6.webp",
                            bgImageSize: "50",
                            bgImageOpacity: "10",
                            bgImageRotation: "0",
                            cornerRadius: "16",
                            imageMargin: "0",
                            zigzag: false,
                        },
                        navbarOptions: {
                            component: "Navbar2",
                            componentList: ["Navbar1", "Navbar2", "Navbar3"],
                            textColor: "#ffffffFF",
                            bgMainColor: "#171717FF",
                            bgSecondaryColor: "#282828FF",
                            primaryColor: "#9c86b0ff",
                            accentColor: "#649EAFFF",
                            withText: true,
                            radius: "15",
                        },
                    },
                    itemsDialogStyleOptions: {
                        textColor: "#ffffffFF",
                        bgMainColor: "#171717ff",
                        bgSecondaryColor: "#28282800",
                        primaryColor: "#9c86b0ff",
                        accentColor: "#6b979eFF",
                        frameComponent: "Frame2",
                        frameComponentList: ["Frame1", "Frame2"],
                        bodyComponent: "Body1",
                        bodyComponentList: ["Body1", "Body2"],
                        cornerRadius: "20",
                        imageMargin: "0",
                    },
                    restaurantDetailsPageOptions: {
                        textColor: "#ffffffFF",
                        bgMainColor: "#171717FF",
                        bgSecondaryColor: "#282828FF",
                        primaryColor: "#9c86b0ff",
                        accentColor: "#6b979eFF",
                        frameComponent: "Frame3",
                        frameComponentList: ["Frame1", "Frame2", "Frame3"],
                        bodyComponent: "Body1",
                        bodyComponentList: ["Body1"],
                        withPattern: true,
                        bgImageMode: "list",
                        bgImage: "/patterns/pattern6.webp",
                        bgImageSize: "90",
                        bgImageOpacity: "10",
                        bgImageRotation: "-45",
                        marginTop: "0",
                        cornerRadius: "25",
                    },
                    splashScreenOptions: {
                        textColor: "#ffffffFF",
                        bgMainColor: "#171717FF",
                        bgSecondaryColor: "#282828FF",
                        primaryColor: "#9c86b0ff",
                        accentColor: "#649EAFFF",
                        frameComponent: "Frame3",
                        frameComponentList: ["Frame1", "Frame2", "Frame3"],
                        bodyComponent: "Body1",
                        bodyComponentList: ["Body1"],
                        withPattern: true,
                        bgImageMode: "list",
                        bgImage: "/patterns/pattern7.webp",
                        bgImageSize: "30",
                        bgImageOpacity: "20",
                        bgImageRotation: "-45",
                        cornerRadius: "60",
                        withLine: true,
                        lineRotation: "30",
                        lineText: "Some Random Text Here To Test Scrolling - This Is Seprated By The Way",
                        transition: "fall",
                        transitionList: ["opacity-swing", "slide-up", "slide-left", "fall", "zoom-fade"],
                    },
                    updatedAt: new Date(Date.now()),
                },
                $setOnInsert: { createdAt: new Date(Date.now()) },
            },
            { upsert: true },
        ).catch((e) => {
            console.log({ e });
            throw new InternalServerErrorException();
        });
    }

    async setupBaseWorkingHours(brandID: string) {
        await this.MenuStyleModel.updateOne(
            { brand: brandID },
            {
                $set: {
                    workingHours: {
                        all: {
                            saturday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            sunday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            monday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            tuesday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            wednesday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            thursday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                            friday: {
                                open: true,
                                from: "12:00",
                                to: "21:00",
                            },
                        },
                    },
                },
                $setOnInsert: { createdAt: new Date(Date.now()) },
            },
            { upsert: true },
        ).catch((e) => {
            console.log({ e });
            throw new InternalServerErrorException();
        });
    }
}
