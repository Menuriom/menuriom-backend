import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserController } from "src/controllers/userPanel/user.controller";
import { UserPermissionGroupSchema } from "src/models/UserPermissionGroups.schema";
import { UserPermissionSchema } from "src/models/UserPermissions.schema";
import { UserSchema } from "src/models/Users.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "PermissionGroup", schema: UserPermissionGroupSchema },
            { name: "Permission", schema: UserPermissionSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [],
    exports: [],
})
export class UserPanelModule {}
