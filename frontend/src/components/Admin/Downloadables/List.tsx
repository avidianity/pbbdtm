import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { createTableColumns, exceptMany, ucwords } from '../../../helpers';
import { Table } from '../../Shared/Table';
import toastr from 'toastr';
import dayjs from 'dayjs';
import { Downloadable } from '../../../contracts/Downloadable';

export function List() {
	const [downloadables, setDownloadables] = useState<Array<Downloadable>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const fetchDownloadables = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<Downloadable>>('/downloadables');
			setDownloadables(exceptMany(data, ['file_id']));
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch Downloadables.');
		} finally {
			setProcessing(false);
		}
	};

	const deleteDownloadable = async (id: any) => {
		setProcessing(true);
		try {
			await axios.delete(`/downloadables?id=${id}`);
			toastr.success('Downloadable deleted successfully.');
			await fetchDownloadables();
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to delete Downloadable.');
			setProcessing(false);
		}
	};

	useEffect(() => {
		fetchDownloadables();
	}, []);

	return (
		<Table
			title='Downloadables'
			columns={createTableColumns(downloadables).map((column) => {
				if (['updated at', 'created at'].includes(column.toLowerCase())) {
					return ucwords(column.split(' ')[0]);
				}
				return column;
			})}
			data={downloadables.map((downloadable) => ({
				...downloadable,
				file: (
					<a href={`${downloadable.file!.url}&download=true`} className='btn btn-success btn-sm'>
						Download
					</a>
				),
				created_at: dayjs(downloadable.created_at).fromNow(),
				updated_at: dayjs(downloadable.updated_at).fromNow(),
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
				deleteDownloadable(id);
			}}
			onRefreshClick={fetchDownloadables}
			withAction={true}
			pagination={true}
			dontShowEdit={true}
			dontShowView={true}
		/>
	);
}
