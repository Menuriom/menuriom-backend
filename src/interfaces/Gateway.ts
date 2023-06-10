import { Request } from "express";

export interface GatewayInterface {
    readonly apiKey: string;

    getIdentifier(amount: number, callback: string, description: string, mobile?: string): Promise<string>;
    getGatewayUrl(identifier: string): string;
    getTransactionResponse(req: Request): TransactionResponse;
    verify(identifier: string, price: number): Promise<VerficationResponseInterface>;
}

export interface VerficationResponseInterface {
    transactionCode: string;
    status: number;
    other?: object;
}

export interface TransactionResponse {
    status: "OK" | "NOK";
    identifier: string;
}
