import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffRoleSchema } from "src/models/StaffRoles.schema";
import { StaffPermissionSchema } from "src/models/StaffPermissions.schema";
import { UserSchema } from "src/models/Users.schema";
import { BrandSchema } from "src/models/Brands.schema";
import { BranchSchema } from "src/models/Branches.schema";
import { BrandController } from "src/controllers/panel/brand.controller";
import { FileService } from "src/services/file.service";
import { StaffSchema } from "src/models/Staff.schema";
import { SessionSchema } from "src/models/Sessions.schema";
import { BranchController } from "src/controllers/panel/branch.controller";
import { StaffController } from "src/controllers/panel/staff.controller";
import { StaffRolesController } from "src/controllers/panel/staffRoles.controller";
import { StaffRoleDefaultSchema } from "src/models/StaffRoleDefaults.schema";
import { BrandsPlanSchema } from "src/models/BrandsPlans.schema";
import { InviteSchema } from "src/models/Invites.schema";
import { PlanSchema } from "src/models/Plans.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Session", schema: SessionSchema },
            { name: "User", schema: UserSchema },
            { name: "Role", schema: StaffRoleSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "BrandsPlan", schema: BrandsPlanSchema },
            { name: "Branch", schema: BranchSchema },
            { name: "Plan", schema: PlanSchema },
            { name: "Staff", schema: StaffSchema },
            { name: "StaffRole", schema: StaffRoleSchema },
            { name: "StaffRoleDefault", schema: StaffRoleDefaultSchema },
            { name: "StaffPermission", schema: StaffPermissionSchema },
            { name: "Invite", schema: InviteSchema },
        ]),
    ],
    controllers: [BrandController, BranchController, StaffController, StaffRolesController],
    providers: [FileService],
    exports: [],
})
export class BrandPanelModule {}
