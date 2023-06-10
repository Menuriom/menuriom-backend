import { randomUUID } from "crypto";
import { Request } from "express";
import { GatewayInterface, TransactionResponse, VerficationResponseInterface } from "src/interfaces/Gateway";

export class WalletGateway implements GatewayInterface {
    readonly apiKey: string;

    constructor() {}

    public async getIdentifier(amount: number, callback: string, description: string, mobile?: string): Promise<string> {
        let identifier = randomUUID();
        return identifier;
    }

    public getGatewayUrl(identifier: string): string {
        // return `${process.env.PAYMENT_CALLBACK_BASE_URL}/${this.productGroup}/wallet?identifier=${identifier}&status=OK`;
        return "";
    }

    public getTransactionResponse(req: Request): TransactionResponse {
        return {
            status: req.query.status == "OK" ? "OK" : "NOK",
            identifier: req.query.identifier.toString(),
        };
    }

    public async verify(identifier: string, price: number): Promise<VerficationResponseInterface> {
        return {
            transactionCode: randomUUID(),
            status: 1,
        };
    }
}
