import { DocumentType } from './DocumentType';
import { File } from './File';
import { Model } from './Model';

export interface DocumentTypeFile extends Model {
	documentType?: DocumentType;
	file?: File;
}
