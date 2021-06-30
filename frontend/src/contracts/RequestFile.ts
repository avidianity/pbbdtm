import { File } from './File';
import { Model } from './Model';
import { Request } from './Request';

export interface RequestFile extends Model {
	request_id: number;
	file_id: number;
	file?: File;
	request?: Request;
}
