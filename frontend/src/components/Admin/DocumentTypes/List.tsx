import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DocumentType } from '../../../contracts/DocumentType';
import { createTableColumns, except, exceptMany, ucwords } from '../../../helpers';
import { Table } from '../../Shared/Table';
import toastr from 'toastr';
import dayjs from 'dayjs';

export function List() {
	const [documentTypes, setDocumentTypes] = useState<Array<DocumentType>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const fetchDocumentTypes = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<DocumentType>>('/document-types');
			setDocumentTypes(
				exceptMany(data, ['requirements', 'files']).map((documentType) =>
					except(
						{
							...documentType,
							work_processing_days: documentType.expiry_days,
						},
						['expiry_days']
					)
				)
			);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch Document Types.');
		} finally {
			setProcessing(false);
		}
	};

	const deleteDocumentType = async (id: any) => {
		setProcessing(true);
		try {
			await axios.delete(`/document-types?id=${id}`);
			toastr.success('Document Type deleted successfully.');
			await fetchDocumentTypes();
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to delete Document Type.');
			setProcessing(false);
		}
	};

	useEffect(() => {
		fetchDocumentTypes();
	}, []);

	return (
		<Table
			title='Document Types'
			columns={createTableColumns(documentTypes).map((column) => {
				if (['updated at', 'created at'].includes(column.toLowerCase())) {
					return ucwords(column.split(' ')[0]);
				}
				return column;
			})}
			data={documentTypes.map((documentType) => ({
				...documentType,
				created_at: dayjs(documentType.created_at).fromNow(),
				updated_at: dayjs(documentType.updated_at).fromNow(),
			}))}
			processing={processing}
			onAddClick={() => history.push(path('add'))}
			onViewClick={({ id }) => {
				history.push(path(`${id}`));
			}}
			onEditClick={({ id }) => {
				history.push(path(`${id}/edit`));
			}}
			onDeleteConfirm={({ id }) => {
				deleteDocumentType(id);
			}}
			onRefreshClick={fetchDocumentTypes}
			withAction={true}
			pagination={true}
		/>
	);
}
