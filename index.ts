/**
 * Antilopay Payment Processor Node.js SDK
 * @module antilopay-node
 * @version 0.0.0
 * @author phyziyx
 * @license MIT
 *
 * This SDK is designed to be used in Node.js (or equivalent environments) only.
 * It is not designed to be used in the browser or in a webview.
 *
 * The SDK is designed to be used with the Antilopay Payment Processor.
 * The API documentation can be found at https://doc.antilopay.com/AntilopayAPI.pdf
 */

import axios, { AxiosInstance } from "axios";
import crypto from "crypto";

//
//
// Interfaces and Types
//
//

type AntilopayPaymentMethod = "CARD_RU" | "SBP" | "SBER_PAY";
type AntilopayPaymentCurrency = "RUB";
type AntilopayProductType = "goods" | "services";

interface IAntilopayServiceConstructor {
  projectId: string;
  secretId: string;
  secretKey: string;
  publicKey: string;
}

interface IAntilopayPaymentIntent {
  /**
   * The project identifier for the payment.
   * @required
   */
  project_identifier: string;
  /**
   * The payment amount in your currency.
   * The amount must be a positive number.
   * Two decimal places are allowed.
   * @required
   */
  amount: number;
  /**
   * The order identifier for the payment.
   * The order identifier must be unique for each payment.
   * @required
   */
  order_id: string;
  /**
   * The amount currency for the payment.
   * @required
   */
  currency: AntilopayPaymentCurrency;
  /**
   * The name of the product or service being purchased.
   * This is used for display purposes only and does not affect the payment.
   * @required
   */
  product_name: string;
  /**
   * The type of product or service being purchased.
   * @required
   */
  product_type: AntilopayProductType;
  /**
   * The quantity of the product or service being purchased.
   * Minimum value is 1.
   * @optional
   * @default 1
   */
  product_quantity?: number;
  /**
   * The VAT rate for the payment.
   * Seems to be in %, such as 10, 20 etc.
   * Mandatory if the merchant's tax system is OSNO.
   * @optional
   * @default 0
   */
  vat?: number;
  /**
   * The payment description.
   * This is used for display purposes only and does not affect the payment.
   * @required
   */
  description: string;
  /**
   * The URL to redirect the user to after the payment is completed successfully.
   * @optional
   */
  success_url?: string;
  /**
   * The URL to redirect the user to after the payment is cancelled or failed.
   * @optional
   */
  fail_url?: string;
  /**
   * Customer's details
   */
  customer: AntilopayCustomer;
  /**
   * The payment method to use for the payment.
   * This is a list of payment methods that are supported by Antilopay.
   * @optional
   */
  prefer_methods?: AntilopayPaymentMethod[];
  /**
   * Merchant's technical information, maximum 255 characters.
   * @optional
   */
  merchant_extra?: string;
  /**
   * Additional parameters for the payment.
   * @optional
   */
  params?: IAntilopayPaymentIntentParams;
}

interface IAntilopayPaymentIntentParams {
  direct_nspk: boolean;
}

interface IAntilopayPaymentIntentResponse {
  /**
   * The error code for the payment.
   * 0 - success
   * anything else - error
   */
  code: number;
  payment_id: string;
  payment_url: string;
  error: string;
}

type AntilopayPaymentIntentResponsePlain = IAntilopayPaymentIntentResponse & {
  direct_nspk: false;
};

type IAntilopayPaymentIntentResponseNSPK = IAntilopayPaymentIntentResponse & {
  direct_nspk: true;
  transaction_id: string;
};

type AntilopayPaymentIntentResponse =
  | AntilopayPaymentIntentResponsePlain
  | IAntilopayPaymentIntentResponseNSPK;

interface IAntilopayCustomer {
  email: string;
  phone: string;
  address: string;
  ipAddress: string;
  fullName: string;
}

//
//
// Classes
//
//

export class AntilopayCustomer implements IAntilopayCustomer {
  public email: string;
  public phone: string;
  public address: string;
  public ipAddress: string;
  public fullName: string;

  constructor({
    email,
    phone,
    address,
    ipAddress,
    fullName,
  }: IAntilopayCustomer) {
    if (!email && !phone) {
      throw new Error("Either email or phone must be provided.");
    }

    this.email = email;
    this.phone = phone;
    this.address = address;
    this.ipAddress = ipAddress;
    this.fullName = fullName;
  }

  public toJSON() {
    return {
      email: this.email,
      phone: this.phone,
      address: this.address,
      ip: this.ipAddress,
      fullname: this.fullName,
    };
  }
}

export class AntilopayService {
  private static instance: AntilopayService | null = null;

  private axiosClient: AxiosInstance | null = null;

  /**
   * The base URL for the Antilopay API.
   * @default "https://api.antilopay.com/v1"
   */
  private baseUrl: string = "https://api.antilopay.com/v1";
  /**
   * The API version for the Antilopay API.
   * Used in the API header 'X-Apay-Sign-Version'.
   * @default 1
   */
  private apiVersion: number = 1;

  /**
   * The signing algorithm for the Antilopay API.
   * The output produced by the signing algorithm is used to sign the API request
   * and is used in the API header 'X-Apay-Sign'.
   * @default "RSA-SHA256"
   */
  private signingAlgorithm: string = "RSA-SHA256";

  /**
   * The output format for the signing algorithm.
   * @default "base64"
   */
  private signingAlgorithmOutput: crypto.BinaryToTextEncoding = "base64";

  /**
   * The project ID for the Antilopay account.
   * This is used to identify the account when making API requests.
   * Used in the API header 'X-Apay-Project-Id'.
   */
  private projectId: string = "";
  private secretId: string = "";
  private secretKey: string = "";
  private publicKey: string = "";

  private constructor() {}

  /**
   *
   * @returns
   */
  public static getInstance(): AntilopayService {
    if (!this.instance) {
      this.instance = new AntilopayService();
    }

    return this.instance;
  }

  /**
   * Initialise the Antilopay Service singleton with the credentials.
   * @param
   */
  public init({
    projectId,
    secretId,
    secretKey,
    publicKey,
  }: IAntilopayServiceConstructor): void {
    this.projectId = projectId;
    this.secretId = secretId;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
  }

  /**
   * Set the base URL for the API.
   * @param url
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the base URL for the API.
   * @returns
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set the API version for the API.
   * @param version
   */
  public setApiVersion(version: number): void {
    this.apiVersion = version;
  }

  /**
   * Get the API version for the API.
   * @returns
   */
  public getApiVersion(): number {
    return this.apiVersion;
  }

  /**
   * Get the project ID for the API.
   * @returns
   */
  public getProjectId(): string {
    return this.projectId;
  }

  /**
   * Get the secret ID for the API.
   * @returns
   */
  public getSecretId(): string {
    return this.secretId;
  }

  /**
   * Get the secret key for the API.
   * @returns
   */
  public getSecretKey(): string {
    return this.secretKey;
  }

  /**
   * Get the public key for the API.
   * @returns
   */
  public getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Get the API headers for the API.
   * @returns
   */
  public getApiHeaders(): Record<string, string> {
    // TODO:
    return {
      "X-Apay-Secret-Id": this.projectId,
      "X-Apay-Sign-Version": this.apiVersion.toString(),
      "X-Apay-Sign": this.generateSignature({}),
    };
  }

  /**
   * Generate the signature for the API request.
   * This is used to authenticate the request with the Antilopay API.
   * @param payload The payload to sign, must a JSON object.
   * @returns The signature for the API request.
   */
  private generateSignature(payload: object): string {
    const data = JSON.stringify(payload);

    const sign = crypto.createSign(this.signingAlgorithm);
    sign.update(data);
    sign.end();

    const signature = sign.sign(this.secretKey, this.signingAlgorithmOutput);
    return signature;
  }

  // TODO:
  // - Implement the POST /signature/check endpoint
  // - Takes in an arbitrary JSON object and returns
  // { "status": "ok" } - if successful
  // { "code": 3, "error": "Invalid sign" } - if failed
  public async verifySignature(
    payload: object
  ): Promise<{ status: string } | { code: number; error: string }> {
    const data = JSON.stringify(payload);

    const response = await axios.post(`${this.baseUrl}/signature/check`, data, {
      headers: this.getApiHeaders(),
    });

    return response.data;
  }

  // TODO:
  public async createPaymentIntent(
    paymentIntent: IAntilopayPaymentIntent
  ): Promise<AntilopayPaymentIntentResponse> {
    const response = await axios.post(
      `${this.baseUrl}/payment/create`,
      paymentIntent,
      {
        headers: this.getApiHeaders(),
      }
    );

    return response.data as AntilopayPaymentIntentResponse;
  }

  // TODO:
}
