import { SetMetadata } from "@nestjs/common";

export const SetPermissions = (...permissions: string[]) => {
    return SetMetadata("permissionsToCheck", permissions);
};

export const SetAuthorizationOperator = (operator: "AND" | "OR") => {
    return SetMetadata("operator", operator);
};
