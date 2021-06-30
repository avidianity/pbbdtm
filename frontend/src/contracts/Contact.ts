import { Model } from './Model';

export interface Contact extends Model {
	name: string;
	email: string;
	message: string;
}
