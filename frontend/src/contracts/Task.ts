import { Model } from './Model';

export interface Task extends Model {
	for: string;
	title: string;
	done: boolean;
	name: string;
	request_id: number;
}
