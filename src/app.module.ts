import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
// middlewares
import { serverOnly } from "./middlewares/server.middleware";
import { AuthCheckMiddleware, GuestMiddleware } from "./middlewares/auth.middleware";
// services
import { AppService } from "./app.service";
// modules
import { AuthModule } from "./modules/auth.module";
import { BrandPanelModule } from "./modules/panel.module";
// schemas
import { AnalyticSchema } from "./models/Analytics.schema";
import { BranchSchema } from "./models/Branches.schema";
import { BrandsPlanSchema } from "./models/BrandsPlans.schema";
import { BrandSchema } from "./models/Brands.schema";
import { BrandTypeSchema } from "./models/BrandTypes.schema";
import { StaffRoleDefaultSchema } from "./models/StaffRoleDefaults.schema";
import { InvoicePaymentSchema } from "./models/InvoicePayments.schema";
import { MenuItemSchema } from "./models/MenuItems.schema";
import { MenuSchema } from "./models/Menus.schema";
import { OrderSchema } from "./models/Orders.schema";
import { PlanLimitationSchema } from "./models/PlansLimitations.schema";
import { PlanSchema } from "./models/Plans.schema";
import { QrCodeSchema } from "./models/QrCodes.schema";
import { TableSchema } from "./models/Tables.schema";
import { StaffSchema } from "./models/Staff.schema";
import { StaffRoleSchema } from "./models/StaffRoles.schema";
import { StaffPermissionSchema } from "./models/StaffPermissions.schema";
import { UserSchema } from "./models/Users.schema";
import { SessionSchema } from "./models/Sessions.schema";
import { AcceptLanguageResolver, CookieResolver, I18nModule } from "nestjs-i18n";
import * as path from "path";
import { FilesController } from "./controllers/files.controller";
import { AccountController } from "./controllers/account.controller";
import { UserController } from "./controllers/user.controller";
import { FileService } from "./services/file.service";

@Module({
    imports: [
        AuthModule,
        BrandPanelModule,
        I18nModule.forRoot({
            fallbackLanguage: "fa",
            loaderOptions: { path: path.join(__dirname, "/i18n/"), watch: true, includeSubfolders: true },
            resolvers: [new CookieResolver(["lang"]), AcceptLanguageResolver],
        }),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL, { dbName: process.env.MONGO_DB }),
        MongooseModule.forFeature([
            { name: "Analytic", schema: AnalyticSchema },
            { name: "Branch", schema: BranchSchema },
            { name: "BrandPlan", schema: BrandsPlanSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "BrandType", schema: BrandTypeSchema },
            { name: "StaffRoleDefault", schema: StaffRoleDefaultSchema },
            { name: "InvoicePayment", schema: InvoicePaymentSchema },
            { name: "MenuesItem", schema: MenuItemSchema },
            { name: "Menue", schema: MenuSchema },
            { name: "Order", schema: OrderSchema },
            { name: "PlanLimitation", schema: PlanLimitationSchema },
            { name: "Plan", schema: PlanSchema },
            { name: "QrCode", schema: QrCodeSchema },
            { name: "Table", schema: TableSchema },
            { name: "Staff", schema: StaffSchema },
            { name: "StaffRole", schema: StaffRoleSchema },
            { name: "StaffPermission", schema: StaffPermissionSchema },
            { name: "User", schema: UserSchema },
            { name: "Session", schema: SessionSchema },
        ]),
    ],
    controllers: [AppController, AccountController, UserController, FilesController],
    providers: [AppService, FileService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(serverOnly).forRoutes({ path: "*", method: RequestMethod.ALL });

        consumer.apply(AuthCheckMiddleware).forRoutes(
            { path: "auth/refresh", method: RequestMethod.POST },
            { path: "auth/logout", method: RequestMethod.POST },
            { path: "auth/check-if-role/*", method: RequestMethod.POST },

            { path: "admin/*", method: RequestMethod.ALL },
            { path: "user/*", method: RequestMethod.ALL },
            { path: "account/*", method: RequestMethod.ALL },
            { path: "panel/*", method: RequestMethod.ALL },
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
