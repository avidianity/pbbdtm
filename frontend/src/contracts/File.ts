import { Model } from './Model';

export interface File extends Model {
	name: string;
	type: string;
	size: number;
	url: string;
}
