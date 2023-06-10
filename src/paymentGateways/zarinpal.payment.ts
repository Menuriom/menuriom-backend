import axios from "axios";
import { Request } from "express";
import { GatewayInterface, TransactionResponse, VerficationResponseInterface } from "src/interfaces/Gateway";

export class ZarinpalGateway implements GatewayInterface {
    readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async getIdentifier(amount: number, callback: string, description: string, mobile?: string): Promise<string> {
        let identifier = "";
        let url = `https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json`;
        if (process.env.PAYMENT_IN_TEST == "true") url = `https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json`;

        await axios
            .post(url, {
                MerchantID: this.apiKey,
                Amount: amount,
                CallbackURL: callback,
                Description: description,
                Mobile: mobile || "",
            })
            .then((response) => {
                if (response.data.Status == 100 && response.data.Authority) identifier = response.data.Authority;
            })
            .catch((error) => {
                throw new Error(error);
                // TODO : log the error in logger
            });
        return identifier;
    }

    public getGatewayUrl(identifier: string): string {
        let url = `https://www.zarinpal.com/pg/StartPay/${identifier}/ZarinGate`;
        if (process.env.PAYMENT_IN_TEST == "true") url = `https://sandbox.zarinpal.com/pg/StartPay/${identifier}`;
        return url;
    }

    public getTransactionResponse(req: Request): TransactionResponse {
        return {
            status: req.query.Status == "OK" ? "OK" : "NOK",
            identifier: req.query.Authority ? req.query.Authority.toString() : "",
        };
    }

    public async verify(identifier: string, price: number): Promise<VerficationResponseInterface> {
        const verficationResponse: VerficationResponseInterface = {
            transactionCode: "",
            status: 0,
        };

        let url = `https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json`;
        if (process.env.PAYMENT_IN_TEST == "true") url = `https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json`;

        await axios
            .post(url, { MerchantID: this.apiKey, Amount: price, Authority: identifier })
            .then((response) => {
                verficationResponse.transactionCode = response.data.RefID || "";
                verficationResponse.status = response.data.Status || 0;
                verficationResponse.other = response.data;
            })
            .catch((error) => {
                throw new Error(error);
                // TODO : log the error in logger
            });

        return verficationResponse;
    }
}
