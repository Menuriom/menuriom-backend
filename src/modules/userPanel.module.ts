import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserController } from "src/controllers/userPanel/user.controller";
import { UserRoleSchema } from "src/models/UserRoles.schema";
import { UserPermissionSchema } from "src/models/UserPermissions.schema";
import { UserSchema } from "src/models/Users.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Role", schema: UserRoleSchema },
            { name: "Permission", schema: UserPermissionSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [],
    exports: [],
})
export class UserPanelModule {}
