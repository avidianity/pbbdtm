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
import { DocumentType } from '../../../contracts/DocumentType';

type Props = {};

const Requests: FC<Props> = () => {
	const [requests, setRequests] = useState<Array<Request>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();
	const [types, setTypes] = useState<Array<DocumentType>>([]);
	const [filter, setFilter] = useState<number | null>();
	const [raws, setRaws] = useState<Array<Request>>([]);

	const path = (path: string) => `${match.path}${path}`;

	const readOnly = match.path.includes(routes.REQUESTS.INACTIVE) || match.path.includes(routes.REQUESTS.ARCHIVED);

	const unexpire = async (request: Request) => {
		try {
			await axios.put(`/requests?id=${request.id}`, { expired: false });
			toastr.success('Request updated successfully.');
			await fetchRequests();
		} catch (error: any) {
			handleError(error);
		}
	};

	const fetchRequests = async () => {
		setProcessing(true);
		try {
			const { data: raw } = await axios.get<Array<Request>>('/requests');
			setRaws(raw);
			const data = filterToRole(raw);
			if (match.path.includes(routes.REQUESTS.INACTIVE)) {
				const filtered = data
					.filter((request) => request.expired)
					.map((request) => ({
						...request,
						continue: (
							<button
								className='btn btn-info btn-sm'
								onClick={(e) => {
									e.preventDefault();
									unexpire(request);
								}}>
								Continue
							</button>
						),
					}));
				return setRequests(
					exceptMany(filtered, [
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
						'acknowledged',
					])
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
		} catch (error: any) {
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
		} catch (error: any) {
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
				// return requests.filter((request) => !request.for || ['Director', 'Releasing'].includes(request.for));
				return requests;
			case 'Registrar':
				// return requests.filter((request) => !request.for || ['Registrar', 'Releasing'].includes(request.for));
				return requests;
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
				const raw = raws.find((r) => r.id === request.id);
				return raw?.for === user.role;
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
						} catch (error: any) {
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

	const fetchTypes = async () => {
		try {
			const response = await axios.get<Array<DocumentType>>('/document-types');
			setTypes(response.data);
			setProcessing(false);
		} catch (error: any) {
			console.log(error.toJSON());
		}
	};

	const print = async () => {
		toastr.info('Printing. Please wait.');

		const items = exceptMany(requests, [
			'updated_at',
			'created_at',
			'approved',
			'acknowledged',
			'evaluation',
			'rejected',
			'expired',
			'status',
			'id',
		]);

		const content = `
            <div class='table-responsive' style='overflow: hidden'>
                <table class='table table-sm' style='overflow: hidden'>
                    <thead>
                        <tr>
                            ${createTableColumns(items)
								.map((column) => `<th>${column}</th>`)
								.join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${items
							.filter((request) => {
								if (filter) {
									return request.documentType?.id === filter;
								}

								return true;
							})
							.map((request) => ({
								...request,
								// created_at: dayjs(request.created_at).format('MMMM DD, YYYY hh:mm A'),
								// updated_at: dayjs(request.updated_at).format('MMMM DD, YYYY hh:mm A'),
								user: request.user!.name,
								documentType: request.documentType!.name,
								// approved: request.approved ? 'Yes' : 'No',
								// acknowledged: request.acknowledged ? 'Yes' : 'No',
								// evaluation: request.evaluation ? request.evaluation : '',
								// rejected: request.rejected ? 'Yes' : 'No',
							}))
							.map((request) => {
								if (!match.path.includes(routes.REQUESTS.ARCHIVED) && !match.path.includes(routes.REQUESTS.INACTIVE)) {
									return {
										...request,
										// expired: request.expired ? 'Yes' : 'No',
										// status: request.acknowledged ? request.status : 'Pending',
									};
								}

								return request;
							})
							.map(
								(request: any) => `
                                <tr>
                                    ${Object.keys(request)
										.map((key) => `<td>${request[key]}</td>`)
										.join('')}
                                </tr>`
							)
							.join('')}
                    </tbody>
                </table>
            </div>
        `;

		const iframe = $('#iframe')[0] as HTMLIFrameElement;
		const css = [
			'https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
			'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css',
			'https://fonts.googleapis.com/css?family=Montserrat:400,700,200',
			origin + '/assets/css/bootstrap.min.css',
			origin + '/assets/css/paper-dashboard.css',
			origin + '/assets/demo/demo.css',
		];
		const window = iframe.contentWindow;

		window?.document.open();

		if (window && window.document) {
			window.document.write('<head>');

			const parsed = await Promise.all(
				css.map(async (url) => {
					try {
						const { data } = await axios.get<string>(url, { timeout: 5000 });
						return `<style>${data}</style>`;
					} catch (_) {
						return `<link href="${url}" rel="stylesheet" />`;
					}
				})
			);

			const styles = Array.from(document.querySelectorAll('style')).map((style) => `<style>${style.innerHTML}</style>`);

			parsed.forEach((css) => {
				window.document.write(css);
			});
			styles.forEach((css) => {
				window.document.write(css);
			});
			window.document.write('</head>');

			window.document.write('<body>');
			window.document.write(content);
			window.document.write('</body>');
			window.document.close();
			window.focus();
			setTimeout(() => {
				window.print();
			}, 500);
		}
	};

	useEffect(() => {
		fetchRequests();
		fetchTypes();
		// eslint-disable-next-line
	}, []);

	return (
		<>
			<TrackRequest />
			<div className='row'>
				<div className='col-12 col-md-6 col-lg-4 col-xl-3'>
					<div className='form-group'>
						<label htmlFor='filter'>Filter</label>
						<select
							className='form-control form-control-sm'
							onChange={(e) => {
								const { value } = e.target;
								if (value === 'All') {
									setFilter(null);
								} else {
									const id = value.parseNumbers();
									const type = types.find((type) => type.id === id);
									if (type) {
										setFilter(id);
									}
								}
							}}
							value={filter ? filter : 'All'}>
							<option value='All'>All</option>
							{types.map((type, index) => (
								<option key={index} value={type.id}>
									{type.name}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className='col-12 col-md-6 col-lg-8 col-xl-9 d-flex align-items-center'>
					<button
						className='btn btn-secondary btn-sm ml-auto'
						onClick={(e) => {
							e.preventDefault();
							print();
						}}>
						Print
					</button>
				</div>
			</div>
			<Table
				id='request-table'
				title={(() => {
					if (!readOnly) {
						return 'Requests';
					}
					const fragments = match.path.split('/');
					return `${ucfirst(fragments[fragments.length - 1])} Requests`;
				})()}
				columns={createTableColumns(requests)}
				data={requests
					.filter((request) => {
						if (filter) {
							return request.documentType?.id === filter;
						}

						return true;
					})
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
						rejected: request.rejected ? (
							<span className='badge badge-danger'>Yes</span>
						) : (
							<span className='badge badge-success'>No</span>
						),
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
			<iframe className='d-none' title='iframe' id='iframe'></iframe>
		</>
	);
};

export default Requests;
