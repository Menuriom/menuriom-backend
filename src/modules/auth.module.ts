import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "src/controllers/auth/auth.controller";
import { BrandSchema } from "src/models/Brands.schema";
import { SessionSchema } from "src/models/Sessions.schema";
import { StaffSchema } from "src/models/Staff.schema";
import { UserSchema } from "src/models/Users.schema";
import { AuthService } from "src/services/auth.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Session", schema: SessionSchema },
            { name: "Brand", schema: BrandSchema },
            { name: "Staff", schema: StaffSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
