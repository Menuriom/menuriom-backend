import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffRoleSchema } from "src/models/StaffRoles.schema";
import { StaffPermissionSchema } from "src/models/StaffPermissions.schema";
import { UserSchema } from "src/models/Users.schema";
import { BrandSchema } from "src/models/Brands.schema";
import { BranchSchema } from "src/models/Branches.schema";
import { UserController } from "src/controllers/brandPanel/user.controller";
import { BrandController } from "src/controllers/brandPanel/brand.controller";
import { AccountController } from "src/controllers/brandPanel/account.controller";
import { FileService } from "src/services/file.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Role", schema: StaffRoleSchema },
            { name: "Permission", schema: StaffPermissionSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "Branch", schema: BranchSchema },
        ]),
    ],
    controllers: [AccountController, UserController, BrandController],
    providers: [FileService],
    exports: [],
})
export class BrandPanelModule {}
