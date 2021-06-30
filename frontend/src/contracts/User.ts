import { File } from './File';
import { Model } from './Model';

export interface User extends Model {
	name: string;
	email: string;
	phone: string;
	password: string;
	role: Roles;
	profile_picture_id?: number;
	profilePicture?: File;
	student_id_number?: string | null;
	type?: string;
}
