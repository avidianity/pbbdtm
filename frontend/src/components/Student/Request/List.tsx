import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { exceptMany } from '../../../helpers';
import { Table } from '../../Shared/Table';
import toastr from 'toastr';
import dayjs from 'dayjs';
import { Request } from '../../../contracts/Request';
import { TrackRequest } from '../../TrackRequest';

export function List() {
	const [requests, setRequests] = useState<Array<Request>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const fetchRequests = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<Request>>('/self/requests');
			setRequests(exceptMany(data, ['document_type_id', 'file_id', 'user_id', 'file', 'acknowledged_dates']));
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch requests.');
		} finally {
			setProcessing(false);
		}
	};

	useEffect(() => {
		fetchRequests();
	}, []);

	return (
		<>
			<TrackRequest />
			<Table
				title='Requests'
				data={requests.map((request) => ({
					...request,
					documentType: request.documentType!.name,
					approved: request.approved ? 'Yes' : 'No',
					expired: request.expired ? <span className='badge badge-red'>Yes</span> : <span className='badge badge-green'>No</span>,
					created_at: dayjs(request.created_at).fromNow(),
					updated_at: dayjs(request.updated_at).fromNow(),
					acknowledged: request.acknowledged ? (
						<span className='badge badge-green'>Yes</span>
					) : (
						<span className='badge badge-red'>No</span>
					),
					status: request.acknowledged ? (
						<span className='badge badge-green'>{request.status}</span>
					) : (
						<span className='badge badge-danger'>Pending</span>
					),
				}))}
				processing={processing}
				onAddClick={() => history.push(path('add'))}
				onViewClick={({ id }) => {
					history.push(path(`${id}`));
				}}
				onEditClick={() => {}}
				onDeleteConfirm={() => {}}
				onRefreshClick={fetchRequests}
				withAction={true}
				pagination={true}
				dontShowEdit={true}
				dontShowDelete={true}
			/>
		</>
	);
}
