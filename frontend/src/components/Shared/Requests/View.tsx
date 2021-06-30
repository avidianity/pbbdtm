import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { Request } from '../../../contracts/Request';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';
import { statuses } from '../../../constants';
import state from '../../../state';
import { User } from '../../../contracts/User';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Task } from '../../../contracts/Task';

dayjs.extend(relativeTime);

export function View() {
	const [request, setRequest] = useState<Request | null>(null);
	const history = useHistory();
	const [updating, setUpdating] = useState(false);
	const [currentStatus, setCurrentStatus] = useState<string>('Registrar');

	const user = state.get<User>('user');

	const fetchRequest = async (requestID: string) => {
		try {
			const { data } = await axios.get<Request>(`/requests/show?id=${requestID}`);
			setRequest(data);
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	const createTask = async (forTask: string) => {
		const title = prompt('Enter title');
		if (!title) {
			toastr.error('You must provide a title.');
			return;
		}
		try {
			await axios.post(`/requests/tasks`, {
				for: forTask,
				title,
				request_id: request?.id,
				done: false,
				name: user.name,
			});
			toastr.success('Task created successfully.');
			fetchRequest(`${request?.id}`);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to create task.', 'Oops!');
		}
	};

	const editTask = async (task: Task) => {
		const title = prompt('Enter title', task.title);
		if (!title) {
			toastr.error('You must provide a title.');
			return;
		}
		try {
			await axios.put(`/requests/tasks?id=${task.id}`, {
				title,
				name: user.name,
			});
			toastr.info('Task updated.', 'Notice');
			fetchRequest(`${request?.id}`);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to update task.', 'Oops!');
		}
	};

	const markTask = async (task: Task, done: boolean) => {
		try {
			await axios.put('/requests/tasks', {
				...task,
				done,
				name: user.name,
			});
			toastr.info('Task updated.', 'Notice');
			fetchRequest(`${request?.id}`);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to update task.', 'Oops!');
		}
	};

	const deleteTask = async (task: Task) => {
		try {
			await axios.delete(`/requests/tasks?id=${task.id}`);
			toastr.info('Task deleted.', 'Notice');
			fetchRequest(`${request?.id}`);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to delete task.', 'Oops!');
		}
	};

	let deleting = false;

	const deleteRequest = async () => {
		if (deleting) {
			return;
		}
		deleting = true;
		try {
			await axios.delete(`/requests?id=${request?.id}`);
			toastr.success('Request deleted successfully.');
			history.goBack();
		} catch (error) {
			handleError(error);
		} finally {
			deleting = false;
		}
	};

	const makeStatuses = (status: RequestStatus) => {
		const level = ((status) => {
			switch (status) {
				case 'Received':
					return 1;
				case 'Payment':
					return 2;
				case 'Processing':
					return 3;
				case 'Evaluating':
					return 4;
				case 'Evaluated':
					return 5;
				case 'Signed':
					return 5;
				case 'Releasing':
					return 5;
				default:
					return 0;
			}
		})(status);

		return {
			statuses: statuses.filter((status) => !['Released', 'Evaluated'].includes(status)),
			level,
		};
	};

	const { params } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		fetchRequest(params.id);
		// eslint-disable-next-line
	}, []);

	const next = ((role) => {
		switch (role) {
			case 'Admin':
				return 'Forward for payment to Cashier';
			case 'Cashier':
				return 'Mark as paid and forward to Processing';
			case 'Processing':
				return 'Forward to Evaluation';
			case 'Evaluation':
				return 'Forward to Signing';
			case 'Director':
				return 'Mark as ready for releasing and forward to Releasing';
			case 'Registrar':
				return 'Mark as ready for releasing and forward to Releasing';
			case 'Releasing':
				return 'Notify client for document release';
			default:
				return '';
		}
	})(user.role);

	const forward = async (assignedRole?: string) => {
		setUpdating(true);
		const data: any = {};
		try {
			const status: RequestStatus = ((role) => {
				if (assignedRole) {
					data.for = assignedRole;
				}
				switch (role) {
					case 'Admin':
						return 'Payment';
					case 'Cashier':
						return 'Processing';
					case 'Processing':
						return 'Evaluating';
					case 'Evaluation':
						return 'Evaluated';
					case 'Director':
						return 'Signed';
					case 'Registrar':
						return 'Signed';
					case 'Releasing':
						return 'Releasing';
					default:
						throw new Error(`Invalid role. ${role}`);
				}
			})(user.role);
			await axios.put('/requests', {
				...data,
				id: request?.id,
				status,
				acknowledged: ['Releasing', 'Released'].includes(status),
			});
			toastr.info('Request has been updated and forwarded.', 'Notice');
			history.goBack();
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Something went wrong, please try again later.', 'Unable to forward');
		} finally {
			setUpdating(false);
		}
	};

	const isForwardable = () => {
		switch (user.role) {
			case 'Admin':
				return request?.status === 'Received';
			case 'Cashier':
				return request?.status === 'Payment';
			case 'Processing':
				return request?.status === 'Processing';
			case 'Evaluation':
				return request?.status === 'Evaluating';
			case 'Director':
				return request?.status === 'Evaluated';
			case 'Registrar':
				return request?.status === 'Evaluated';
			case 'Releasing':
				return request?.status === 'Signed';
		}
	};
	const origin = window.location.origin;
	const exportToPDF = async () => {
		toastr.info('Printing. Please wait.');
		const card = $(String($('#request-card')[0].innerHTML));

		card.find('button').remove();
		card.find('.bi-plus-circle').remove();
		card.find('i[title="Mark as Not Done"]').remove();
		card.find('i[title="Mark as Done"]').remove();
		card.find('i[title="Edit"]').remove();
		card.find('i[title="Delete"]').remove();

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

			parsed.forEach((css) => {
				window.document.write(css);
			});
			window.document.write('</head>');

			window.document.write('<body>');
			window.document.write(card.html());
			window.document.write('</body>');
			window.document.close();
			window.focus();
			setTimeout(() => {
				window.print();
			}, 500);
		}
	};

	const taskBelongsToUser = (type: string) => {
		if (['Payment', 'Paid'].includes(type)) {
			return user.role === 'Cashier';
		} else if (['Received'].includes(type)) {
			return user.role === 'Admin';
		} else if (['Evaluated'].includes(type)) {
			return user.role === 'Evaluation';
		} else if (['Signed'].includes(type)) {
			return user.role === 'Director' || user.role === 'Registrar';
		} else if (['Releasing', 'Released'].includes(type)) {
			return user.role === 'Releasing';
		} else {
			return type === user.role;
		}
	};

	return (
		<div className='container'>
			<div className='row'>
				<div className='col-12'>
					<h3 className='mb-0'>View Request</h3>
				</div>
				<div className='col-12 d-flex'>
					<button
						className='btn btn-info btn-sm align-self-center'
						onClick={(e) => {
							e.preventDefault();
							history.goBack();
						}}>
						Back
					</button>
					{user.role !== 'Applicant' ? (
						<Link to={`${window.location.pathname}/edit`} className='btn btn-warning btn-sm align-self-center ml-auto'>
							Edit
						</Link>
					) : null}
					{user.role !== 'Applicant' ? (
						<a
							href={`${window.location.pathname}/delete`}
							className='btn btn-danger btn-sm align-self-center ml-1'
							onClick={(e) => {
								e.preventDefault();
								$('#deleteRequestModal').modal('show');
							}}>
							Delete
						</a>
					) : null}
				</div>
				<div className='col-12' id='request-card'>
					{request ? (
						<div className='card shadow rounded'>
							<div className='card-header'>
								{!['Applicant', 'Evaluation'].includes(user.role) && isForwardable() ? (
									<button
										className={`btn btn-info btn-sm ${outIf(updating || !request.acknowledged, 'disabled')}`}
										onClick={(e) => {
											e.preventDefault();
											forward();
										}}
										disabled={updating || !request.acknowledged}>
										<i className='fas fa-bell'></i>{' '}
										{request.acknowledged ? next : 'You must acknowledge the request first'}
									</button>
								) : null}
								{user.role === 'Evaluation' ? (
									<button
										className={`btn btn-info btn-sm ${outIf(updating || !request.acknowledged, 'disabled')}`}
										onClick={(e) => {
											e.preventDefault();
											$('#forwardRequestModal').modal('toggle');
										}}
										disabled={updating || !request.acknowledged}>
										<i className='fas fa-bell'></i>{' '}
										{request.acknowledged ? 'Forward' : 'You must acknowledge the request first'}
									</button>
								) : null}
								<button
									className={`btn btn-success btn-sm`}
									onClick={(e) => {
										e.preventDefault();
										exportToPDF();
									}}>
									<i className='fas fa-print'></i> Export to PDF
								</button>
							</div>
							<div className='card-body'>
								<p className='card-title'>Requester's Name: {request.user!.name}</p>
								<p className='card-text'>Document Type: {request.documentType!.name}</p>
								<p className='card-text'>Expired: {request.expired ? 'Yes' : 'No'}</p>
								<p className='card-text'>Acknowledged: {request.acknowledged ? 'Yes' : 'No'}</p>
								{request.user?.student_id_number ? (
									<p className='card-text'>Student ID Number: {request.user.student_id_number}</p>
								) : null}
								<p className='card-text'>Evaluation: {request.evaluation}</p>
								<p className='card-text'>
									Last Updated By:{' '}
									{request.logs && request.logs.length > 0 && request.logs[0].user.role !== 'Applicant'
										? `${request.logs[0].user.name} - ${dayjs(request.logs[0].created_at).format('MMMM DD, YYYY')}`
										: 'N/A'}
								</p>
								<p className='card-text mb-1'>Status: {request.status}</p>
								<p className='card-title'>Files:</p>
								<div className='container-fluid'>
									<div className='row'>
										{request.files?.map((file, index) => (
											<div className='col-12 col-md-4 col-lg-3 col-xl-2' key={index}>
												<a href={`${file.file?.url}&download=true`}>{file.file?.name}</a>
											</div>
										))}
									</div>
								</div>
								<ul className='list-group'>
									{(({ level, statuses }) => {
										return statuses.map((status, index) => (
											<li className='list-group-item' key={index}>
												<div className='d-flex align-items-center'>
													{taskBelongsToUser(status) ? (
														<div className='mr-4'>
															<i
																className='bi bi-plus-circle clickable'
																title='Add Task'
																onClick={() => createTask(status)}></i>
														</div>
													) : null}
													{level !== 0 ? (
														level >= index + 1 ? (
															<i className='bi bi-check-circle-fill mr-1'></i>
														) : (
															<i className='bi bi-circle mr-1'></i>
														)
													) : (
														<i className='bi bi-x-circle-fill mr-1'></i>
													)}
													{status}
												</div>
												{request.tasks && request.tasks.length > 0 ? (
													<ul className='list-group mt-2'>
														{request.tasks
															.filter((task) => task.for === status)
															.map((task, index) => (
																<li className='list-group-item' key={index}>
																	<div className='d-flex align-items-center'>
																		{task.done ? (
																			<i className='bi bi-check-circle-fill mr-1'></i>
																		) : (
																			<i className='bi bi-circle mr-1'></i>
																		)}
																		<span>
																			{task.title} -{' '}
																			<small>
																				by {task.name} |{' '}
																				{dayjs(task.updated_at).format('MMMM DD, YYYY hh:mm A')}
																			</small>
																		</span>
																		{taskBelongsToUser(status) ? (
																			<div className='ml-auto'>
																				{task.done ? (
																					<i
																						className='bi bi-check-circle-fill mx-1 clickable'
																						title='Mark as Not Done'
																						onClick={() => markTask(task, false)}></i>
																				) : (
																					<i
																						className='bi bi-check-circle mx-1 clickable'
																						title='Mark as Done'
																						onClick={() => markTask(task, true)}></i>
																				)}
																				<i
																					className='bi bi-info-circle clickable'
																					title='Edit'
																					onClick={() => editTask(task)}></i>
																				<i
																					className='bi bi-x-circle mx-1 clickable'
																					title='Delete'
																					onClick={() => deleteTask(task)}></i>
																			</div>
																		) : null}
																	</div>
																</li>
															))}
													</ul>
												) : null}
											</li>
										));
									})(makeStatuses(request.status))}
								</ul>
								<div className='card w-100 mx-1 my-4 shadow rounded'>
									<div className='card-header'>
										<h4 className='card-title'>History</h4>
									</div>
									<div className='card-body table-responsive' style={{ overflowY: 'hidden' }}>
										<table className='table table-sm text-center'>
											<thead>
												<tr>
													<th>User</th>
													<th>Action</th>
													<th>Date</th>
												</tr>
											</thead>
											<tbody>
												{request.logs!.length === 0 ? (
													<tr>
														<td></td>
														<td>No Data</td>
														<td></td>
													</tr>
												) : null}
												{request.logs!.map((log, index) => (
													<tr key={index}>
														<td>{log.user.name}</td>
														<td>{log.action}</td>
														<td>{dayjs(log.updated_at).format('MMMM DD, YYYY hh:mm A')}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className='d-flex h-100 w-100'>
							<div className='align-self-center mx-auto'>
								<i className='fas fa-circle-notch fa-spin fa-2x'></i>
							</div>
						</div>
					)}
				</div>
			</div>
			<div
				className='modal fade'
				id={`deleteRequestModal`}
				tabIndex={-1}
				role='dialog'
				aria-labelledby={`deleteRequestModalLabel`}
				aria-hidden='true'>
				<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title' id={`deleteRequestModalLabel`}>
								Delete Request
							</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>Are you sure you want to delete this request?</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									$('#deleteRequestModal').modal('hide');
									deleteRequest();
								}}>
								Confirm
							</button>
							<button type='button' className='btn btn-secondary btn-sm' data-dismiss='modal'>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
			<div
				className='modal fade'
				id={`forwardRequestModal`}
				tabIndex={-1}
				role='dialog'
				aria-labelledby={`forwardRequestModalLabel`}
				aria-hidden='true'>
				<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title' id={`forwardRequestModalLabel`}>
								Forward Request
							</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>
							<select
								className='form-control'
								onChange={(e) => {
									setCurrentStatus(e.target.value);
								}}>
								{['Registrar', 'Director'].map((status, index) => (
									<option value={status} key={index}>
										{status}
									</option>
								))}
							</select>
						</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									$('#forwardRequestModal').modal('hide');
									if (
										[
											'Admin',
											'Processing',
											'Cashier',
											'Evaluation',
											'Director',
											'Registrar',
											'Releasing',
											'Applicant',
										].includes(currentStatus)
									) {
										forward(currentStatus);
									}
								}}>
								Forward
							</button>
							<button type='button' className='btn btn-secondary btn-sm' data-dismiss='modal'>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
			<iframe title='Print Page' id='iframe' className='d-none'></iframe>
		</div>
	);
}