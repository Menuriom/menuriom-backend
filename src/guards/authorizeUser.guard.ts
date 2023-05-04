import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";

@Injectable()
export class AuthorizeUser implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const brandID = request.headers["brand"] || "";

        const permissionsToCheck = this.reflector.get("permissionsToCheck", context.getHandler()) || [];
        const operator = this.reflector.get("operator", context.getHandler()) || "OR";

        try {
            // check if user is owner
            const isUserOwner = await this.BrandModel.exists({ _id: brandID, creator: request.session.userID }).exec();
            if (isUserOwner) return true;
        } catch (e) {
            throw new ForbiddenException();
        }

        const staff = await this.StaffModel.findOne({ brand: brandID, user: request.session.userID }).populate("role", "name permissions").exec();
        if (!staff) return false;
        const userPermissions = [...staff.role.permissions];

        // then check the requested permission list agains it
        if (operator == "AND") {
            for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) == -1) return false;
            return true;
        } else {
            for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) != -1) return true;
            return false;
        }
        throw new ForbiddenException();
    }
}
