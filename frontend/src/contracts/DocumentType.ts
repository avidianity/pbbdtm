import { DocumentTypeFile } from './DocumentTypeFile';
import { Model } from './Model';

export interface DocumentType extends Model {
	name: string;
	requirements: string[];
	expiry_days: number;
	type: string;
	files?: DocumentTypeFile[];
}
