import { DocumentType } from './DocumentType';
import { File } from './File';
import { Log } from './Log';
import { Model } from './Model';
import { RequestFile } from './RequestFile';
import { Task } from './Task';
import { User } from './User';

export interface Request extends Model {
	request_id: string;
	user_id: number;
	document_type_id: number;
	approved: boolean;
	expired: boolean;
	acknowledged: boolean;
	file_id: number | null;
	status: RequestStatus;
	documentType?: DocumentType;
	for?: string;
	user?: User;
	file?: File;
	logs?: Array<Log>;
	tasks?: Array<Task>;
	evaluation: string | null;
	copies: number;
	reason: string;
	files?: RequestFile[];
}
