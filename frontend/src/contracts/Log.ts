import { Model } from './Model';
import { User } from './User';

export interface Log extends Model {
	action: string;
	loggable: any;
	loggable_type: string;
	loggable_id: number;
	user_id: number;
	user: User;
}
