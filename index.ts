// Antilopay Payment Processor SDK
// A TypeScript first implementation of the Antilopay Payment Processor SDK.
// This SDK is designed to be used in Node.js (or equivalent environments) only.

import axios from "axios";
import crypto from "crypto";

//
//
// Interfaces
//
//

interface IAntilopayServiceConstructor {
  projectId: string;
  secretId: string;
  secretKey: string;
  publicKey: string;
}

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
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.ipAddress = ipAddress;
    this.fullName = fullName;
  }
}

export class AntilopayService {
  private static instance: AntilopayService | null = null;

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
      "X-Apay-Sign": this.generateSignature("TODO"),
    };
  }

  /**
   * Generate the signature for the API request.
   * This is used to authenticate the request with the Antilopay API.
   * @param payload The payload to sign, must be a stringified JSON object.
   * @returns The signature for the API request.
   */
  private generateSignature(payload: string): string {
    const sign = crypto.createSign(this.signingAlgorithm);
    sign.update(payload);
    return sign.sign(this.secretKey, this.signingAlgorithmOutput);
  }

  // TODO:
  public async createPaymentIntent(
    amount: number,
    currency: string
  ): Promise<string> {
    const data = JSON.stringify({
      amount,
      currency,
      projectId: this.projectId,
      secretId: this.secretId,
    });

    const response = await axios.post(`${this.baseUrl}/payment_intents`, data, {
      headers: this.getApiHeaders(),
    });

    return response.data.id;
  }
}
