import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LikeController } from "src/controllers/menu/like.controller";
import { MenuInfoController } from "src/controllers/menu/menuInfo.controller";
import { UtknController } from "src/controllers/menu/utkn.controller";
import { BranchSchema } from "src/models/Branches.schema";
import { BrandSchema } from "src/models/Brands.schema";
import { LikeSchema } from "src/models/Likes.schema";
import { MenuCategorySchema } from "src/models/MenuCategories.schema";
import { MenuItemSchema } from "src/models/MenuItems.schema";
import { MenuSytleSchema } from "src/models/MenuStyles.schema";
import { UtknSchema } from "src/models/Utkns.schema";
import { WorkingHourSchema } from "src/models/WorkingHours.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Branch", schema: BranchSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "MenuCategory", schema: MenuCategorySchema },
            { name: "MenuItem", schema: MenuItemSchema },
            { name: "MenuStyle", schema: MenuSytleSchema },
            { name: "WorkingHour", schema: WorkingHourSchema },
            { name: "Utkn", schema: UtknSchema },
            { name: "Like", schema: LikeSchema },
        ]),
    ],
    controllers: [MenuInfoController, UtknController, LikeController],
    providers: [],
    exports: [],
})
export class MenuModule {}
