import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
// middlewares
import { serverOnly } from "./middlewares/server.middleware";
import { AuthCheckMiddleware, GuestMiddleware } from "./middlewares/auth.middleware";
// services
import { AppService } from "./app.service";
// schemas
import { AnalyticsSchema } from "./models/Analytics.schema";
import { BranchesSchema } from "./models/Branches.schema";
import { BrandsPlansSchema } from "./models/BrandsPlans.schema";
import { BrandsSchema } from "./models/Brands.schema";
import { BrandTypesSchema } from "./models/BrandTypes.schema";
import { DefaultUserPermissionGroupsSchema } from "./models/DefaultUserPermissionGroups.schema";
import { InvoicePaymentsSchema } from "./models/InvoicePayments.schema";
import { MenuItemsSchema } from "./models/MenuItems.schema";
import { MenusSchema } from "./models/Menus.schema";
import { OrdersSchema } from "./models/Orders.schema";
import { PlanLimitationsSchema } from "./models/PlansLimitations.schema";
import { PlansSchema } from "./models/Plans.schema";
import { QrCodesSchema } from "./models/QrCodes.schema";
import { TablesSchema } from "./models/Tables.schema";
import { UserBranchPermissionsSchema } from "./models/UserBranchPermissions.schema";
import { UserPermissionGroupsSchema } from "./models/UserPermissionGroups.schema";
import { UserPermissionsSchema } from "./models/UserPermissions.schema";
import { UsersSchema } from "./models/users.schema";
import { AuthService } from "./services/auth.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL, { dbName: process.env.MONGO_DB }),
        MongooseModule.forFeature([
            { name: "Analytics", schema: AnalyticsSchema },
            { name: "Branches", schema: BranchesSchema },
            { name: "BrandPlans", schema: BrandsPlansSchema },
            { name: "Brands", schema: BrandsSchema },
            { name: "BrandTypes", schema: BrandTypesSchema },
            { name: "DefaultUserPermissionGroups", schema: DefaultUserPermissionGroupsSchema },
            { name: "InvoicePayments", schema: InvoicePaymentsSchema },
            { name: "MenuesItems", schema: MenuItemsSchema },
            { name: "Menues", schema: MenusSchema },
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
    providers: [AppService, AuthService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(serverOnly).forRoutes({ path: "*", method: RequestMethod.ALL });

        consumer.apply(AuthCheckMiddleware).forRoutes(
            { path: "auth/refresh", method: RequestMethod.POST },
            { path: "auth/check-if-role/*", method: RequestMethod.POST },

            { path: "admin/*", method: RequestMethod.ALL },
            { path: "user/*", method: RequestMethod.ALL },

            { path: "users/info", method: RequestMethod.ALL },
        );

        consumer
            .apply(GuestMiddleware)
            .forRoutes(
                { path: "auth/send-code", method: RequestMethod.ALL },
                { path: "auth/verify", method: RequestMethod.ALL },
                { path: "auth/register", method: RequestMethod.ALL },
                { path: "auth/continue-with-google", method: RequestMethod.ALL },
            );
    }
}
