import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { UserPermission } from "./UserPermissions.schema";
export type UserRoleDocument = UserRole & Document;

export const UserRoleSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface UserRole {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions: Array<UserPermission | String>;
    createdAt: Date;
    translation: Translation;
}
