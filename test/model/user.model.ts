import { IAddress } from "./address.model";

export interface IUser {
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: number;
    linkedinProfile?: string;
    email?: string;
    address: IAddress;

}