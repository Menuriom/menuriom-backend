import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffRoleSchema } from "src/models/StaffRoles.schema";
import { StaffPermissionSchema } from "src/models/StaffPermissions.schema";
import { UserSchema } from "src/models/Users.schema";
import { BrandSchema } from "src/models/Brands.schema";
import { BranchSchema } from "src/models/Branches.schema";
import { BrandController } from "src/controllers/brandPanel/brand.controller";
import { FileService } from "src/services/file.service";
import { StaffSchema } from "src/models/Staff.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Role", schema: StaffRoleSchema },
            { name: "Permission", schema: StaffPermissionSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "Branch", schema: BranchSchema },
            { name: "Staff", schema: StaffSchema },
        ]),
    ],
    controllers: [BrandController],
    providers: [FileService],
    exports: [],
})
export class BrandPanelModule {}
