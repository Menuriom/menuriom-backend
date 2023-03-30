import { Request as Req } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface payload {
    sessionID: string;
    userID: string;
    ipAddr: string | string[] | null;
    userAgent: string;
}

export interface Request extends Req {
    session?: payload & JwtPayload;
}
