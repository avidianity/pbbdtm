import { File } from './File';
import { Model } from './Model';

export interface Downloadable extends Model {
	name: string;
	file_id: number;
	file?: File;
	category?: string;
}
