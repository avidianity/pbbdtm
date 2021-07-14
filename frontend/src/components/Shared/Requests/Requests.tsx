import React, { FC, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { AcknowledgedDate, Request } from '../../../contracts/Request';
import { createTableColumns, exceptMany, handleError, ucfirst } from '../../../helpers';
import { Table } from '../Table';
import toastr from 'toastr';
import dayjs from 'dayjs';
import state from '../../../state';
import { User } from '../../../contracts/User';
import { TrackRequest } from '../../TrackRequest';
import axios from 'axios';
import { routes } from '../../../routes';

type Props = {};

const Requests: FC<Props> = () => {
	const [requests, setRequests] = useState<Array<Request>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const readOnly = match.path.includes(routes.REQUESTS.INACTIVE) || match.path.includes(routes.REQUESTS.ARCHIVED);

	const fetchRequests = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<Request>>('/requests');
			if (match.path.includes(routes.REQUESTS.INACTIVE)) {
				return setRequests(
					exceptMany(data, [
						'file',
						'file_id',
						'user_id',
						'document_type_id',
						'tasks',
						'status',
						'acknowledged',
						'expired',
						'files',
						'for',
						'evaluation',
						'acknowledged_dates',
					]).filter((request) => request.expired)
				);
			}
			if (match.path.includes(routes.REQUESTS.ARCHIVED)) {
				return setRequests(
					exceptMany(data, [
						'file',
						'file_id',
						'user_id',
						'document_type_id',
						'tasks',
						'status',
						'acknowledged',
						'expired',
						'files',
						'for',
						'evaluation',
						'acknowledged_dates',
					]).filter((request) => request.approved)
				);
			}
			setRequests(
				exceptMany(data, ['file', 'file_id', 'user_id', 'document_type_id', 'tasks', 'files', 'for', 'acknowledged_dates'])
			);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch requests.');
		} finally {
			setProcessing(false);
		}
	};

	const deleteRequest = async (id: any) => {
		setProcessing(true);
		try {
			await axios.delete(`/requests?id=${id}`);
			toastr.success('Request deleted successfully.');
			await fetchRequests();
		} catch (error) {
			console.log(error.toJSON());
			handleError(error);
			setProcessing(false);
		}
	};

	const user = state.get<User>('user');

	const filterToRole = (requests: Array<Request>) => {
		switch (user.role) {
			case 'Admin':
				return requests;
			case 'Cashier':
				return requests.filter((request) => request.status === 'Payment');
			case 'Evaluation':
				return requests.filter((request) => request.status === 'Evaluating');
			case 'Director':
				return requests.filter((request) => !request.for || request.for !== 'Registrar');
			case 'Registrar':
				return requests.filter((request) => !request.for || request.for !== 'Director');
			case 'Releasing':
				return requests.filter((request) => request.status === 'Signed' || request.status === 'Releasing');
			case 'Applicant':
				return requests.filter((request) => request.user_id === user.id);
		}
	};

	const isAcknowledgable = (request: Request) => {
		switch (request.status) {
			case 'Received':
				return user.role === 'Admin';
			case 'Payment':
				return user.role === 'Cashier';
			case 'Evaluating':
				return user.role === 'Evaluation';
			case 'Evaluated':
				return user.role === 'Registrar' || user.role === 'Director';
			case 'Signed':
				return user.role === 'Releasing';
			default:
				return false;
		}
	};

	const renderAcknowledged = (request: Request) => {
		if (isAcknowledgable(request)) {
			return request.acknowledged ? (
				<button className='btn btn-warning btn-sm disabled' disabled>
					Done
				</button>
			) : (
				<button
					className='btn btn-info btn-sm'
					onClick={async (e) => {
						e.preventDefault();
						e.currentTarget.setAttribute('disabled', 'true');
						e.currentTarget.classList.add('disabled');
						e.currentTarget.textContent = 'Acknowledging...';
						try {
							const { data } = await axios.get(`/requests/show?id=${request.id}`);
							const dates = Array.from<AcknowledgedDate>(JSON.parse(data.acknowledged_dates));
							dates.push({ date: new Date().toJSON(), status: data.status });

							if (user.role === 'Releasing') {
								dates.push({ date: new Date().toJSON(), status: 'Releasing' });
							}

							await axios.put(`/requests?id=${data.id}`, {
								acknowledged: true,
								acknowledged_dates: JSON.stringify(dates),
							});
							toastr.info('Request acknowledged.', 'Notice');
							await fetchRequests();
						} catch (error) {
							console.log(error.toJSON(), request);
							toastr.error('Unable to acknowledge request.');
						}
					}}>
					Acknowledge
				</button>
			);
		}
		return request.acknowledged ? <span className='badge badge-green'>Yes</span> : <span className='badge badge-red'>No</span>;
	};

	useEffect(() => {
		fetchRequests();
		// eslint-disable-next-line
	}, []);

	return (
		<>
			<TrackRequest />
			<Table
				title={(() => {
					if (!readOnly) {
						return 'Requests';
					}
					const fragments = match.path.split('/');
					return `${ucfirst(fragments[fragments.length - 1])} Requests`;
				})()}
				columns={createTableColumns(requests)}
				data={filterToRole(requests)
					.map((request) => ({
						...request,
						created_at: dayjs(request.created_at).format('MMMM DD, YYYY hh:mm A'),
						updated_at: dayjs(request.updated_at).format('MMMM DD, YYYY hh:mm A'),
						user: request.user!.name,
						documentType: request.documentType!.name,
						approved: request.approved ? (
							<span className='badge badge-green'>Yes</span>
						) : (
							<span className='badge badge-red'>No</span>
						),
						acknowledged:
							!match.path.includes(routes.REQUESTS.ARCHIVED) && !match.path.includes(routes.REQUESTS.INACTIVE)
								? renderAcknowledged(request)
								: '',
						evaluation: request.evaluation ? request.evaluation : '',
					}))
					.map((request) => {
						if (!match.path.includes(routes.REQUESTS.ARCHIVED) && !match.path.includes(routes.REQUESTS.INACTIVE)) {
							return {
								...request,
								expired: request.expired ? (
									<span className='badge badge-red'>Yes</span>
								) : (
									<span className='badge badge-green'>No</span>
								),
								status: request.acknowledged ? (
									<span className='badge badge-green'>{request.status}</span>
								) : (
									<span className='badge badge-danger'>Pending</span>
								),
							};
						}

						return request;
					})}
				processing={processing}
				onAddClick={() => history.push(path('add'))}
				onViewClick={({ id }) => {
					history.push(path(`${id}`));
				}}
				onEditClick={({ id }) => {
					history.push(path(`${id}/edit`));
				}}
				onDeleteConfirm={({ id }) => {
					deleteRequest(id);
				}}
				onRefreshClick={fetchRequests}
				withAction={!readOnly}
				pagination={true}
				dontShowView={user.role === 'Applicant' || readOnly}
				dontShowDelete={user.role === 'Applicant' || readOnly}
				disableAddButton={user.role !== 'Applicant' || readOnly}
			/>
		</>
	);
};

export default Requests;
