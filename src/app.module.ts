import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppService } from "./app.service";
import { AnalyticsSchema } from "./models/AnalyticsSchema";
import { BranchesSchema } from "./models/BranchesSchema";
import { BrandPlansSchema } from "./models/BrandPlansSchema";
import { BrandsSchema } from "./models/BrandsSchema";
import { BrandTypesSchema } from "./models/BrandTypesSchema";
import { DefaultUserPermissionGroupsSchema } from "./models/DefaultUserPermissionGroupsSchema";
import { InvoicePaymentsSchema } from "./models/InvoicePaymentsSchema";
import { MenuesItemsSchema } from "./models/MenueItemsSchema";
import { MenuesSchema } from "./models/MenuesSchema";
import { OrdersSchema } from "./models/OrdersSchema";
import { PlanLimitationsSchema } from "./models/PlansLimitationsSchema";
import { PlansSchema } from "./models/PlansSchema";
import { QrCodesSchema } from "./models/QrCodesSchema";
import { TablesSchema } from "./models/TablesSchema";
import { UserBranchPermissionsSchema } from "./models/UserBranchPermissionsSchema";
import { UserPermissionGroupsSchema } from "./models/UserPermissionGroupsSchema";
import { UserPermissionsSchema } from "./models/UserPermissions.schema";
import { UsersSchema } from "./models/users.schema";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL, { dbName: process.env.MONGO_DB }),
        MongooseModule.forFeature([
            { name: "Analytics", schema: AnalyticsSchema },
            { name: "Branches", schema: BranchesSchema },
            { name: "BrandPlans", schema: BrandPlansSchema },
            { name: "Brands", schema: BrandsSchema },
            { name: "BrandTypes", schema: BrandTypesSchema },
            { name: "DefaultUserPermissionGroups", schema: DefaultUserPermissionGroupsSchema },
            { name: "InvoicePayments", schema: InvoicePaymentsSchema },
            { name: "MenuesItems", schema: MenuesItemsSchema },
            { name: "Menues", schema: MenuesSchema },
            { name: "Orders", schema: OrdersSchema },
            { name: "PlanLimitations", schema: PlanLimitationsSchema },
            { name: "Plans", schema: PlansSchema },
            { name: "QrCodes", schema: QrCodesSchema },
            { name: "Tables", schema: TablesSchema },
            { name: "UserBranchPermissions", schema: UserBranchPermissionsSchema },
            { name: "UserPermissionGroups", schema: UserPermissionGroupsSchema },
            { name: "UserPermissions", schema: UserPermissionsSchema },
            { name: "Users", schema: UsersSchema },
        ]),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
