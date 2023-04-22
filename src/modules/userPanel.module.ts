import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserRoleSchema } from "src/models/UserRoles.schema";
import { UserPermissionSchema } from "src/models/UserPermissions.schema";
import { UserSchema } from "src/models/Users.schema";
import { BrandSchema } from "src/models/Brands.schema";
import { BranchSchema } from "src/models/Branches.schema";
import { UserController } from "src/controllers/userPanel/user.controller";
import { BrandController } from "src/controllers/userPanel/brand.controller";
import { AccountController } from "src/controllers/userPanel/account.controller";
import { FileService } from "src/services/file.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Role", schema: UserRoleSchema },
            { name: "Permission", schema: UserPermissionSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "Branch", schema: BranchSchema },
        ]),
    ],
    controllers: [AccountController, UserController, BrandController],
    providers: [FileService],
    exports: [],
})
export class UserPanelModule {}
