import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "src/controllers/auth/auth.controller";
import { SessionSchema } from "src/models/Sessions.schema";
import { UserSchema } from "src/models/Users.schema";
import { AuthService } from "src/services/auth.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "User", schema: UserSchema },
            { name: "Session", schema: SessionSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
