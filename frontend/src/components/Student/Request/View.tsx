import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import toastr from 'toastr';
import { statuses } from '../../../constants';
import { AcknowledgedDate, Request } from '../../../contracts/Request';
import { User } from '../../../contracts/User';
import { handleError } from '../../../helpers';
import state from '../../../state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function View() {
	const [request, setRequest] = useState<Request | null>(null);
	const history = useHistory();
	const [feedback, setFeedback] = useState('');

	const fetchRequest = async (requestID: string) => {
		try {
			const { data } = await axios.get<Request>(`/requests/show?id=${requestID}`);
			setRequest(data);
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	const user = state.get<User>('user');

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
				case 'Evaluating':
					return 3;
				case 'Evaluated':
					return 4;
				case 'Signed':
					return 4;
				case 'Releasing':
					return 4;
				case 'Released':
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
	const origin = window.location.origin;
	const exportToPDF = async () => {
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
						const { data } = await axios.get<string>(url);
						return `<style>${data}</style>`;
					} catch (_) {
						return `<link href="${url}" rel="stylesheet" />`;
					}
				})
			);

			console.log(parsed);

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

	const sendFeedback = async () => {
		try {
			await axios.put(`/requests?id=${request?.id}`, {
				evaluation: feedback,
			});
			setRequest({
				...request!,
				evaluation: feedback,
			});
			toastr.success('Feedback sent successfully!');
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to send feedback.');
		}
	};

	const findDate = (status: string) => {
		const dates = Array.from<AcknowledgedDate>(JSON.parse(request?.acknowledged_dates || '[]'));
		return dates.find((date) => date.status === status);
	};

	useEffect(() => {
		fetchRequest(params.id);
		// eslint-disable-next-line
	}, []);

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
					{user && user.role !== 'Applicant' ? (
						<Link to={`${window.location.pathname}/edit`} className='btn btn-warning btn-sm align-self-center ml-auto'>
							Edit
						</Link>
					) : null}
					{user && user.role !== 'Applicant' ? (
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
								<p className='card-title'>Date: {dayjs(request.updated_at).format('MMMM DD, YYYY hh:mm A')}</p>
								<p className='card-text'>Document Type: {request.documentType!.name}</p>
								{request.user?.student_id_number ? (
									<p className='card-text'>Student ID Number: {request.user.student_id_number}</p>
								) : null}
								<p className='card-text'>
									Last Updated By:{' '}
									{request.logs &&
									request.logs.length > 0 &&
									request.logs[request.logs.length - 1].user.role !== 'Applicant'
										? `${request.logs[request.logs.length - 1].user.name} - ${dayjs(
												request.logs[request.logs.length - 1].created_at
										  ).format('MMMM DD, YYYY')}`
										: 'N/A'}
								</p>
								<p className='card-text mb-2'>Status: {request.status}</p>
								<ul className='list-group'>
									{(({ level, statuses }) => {
										return statuses.map((status, index) => (
											<li className='list-group-item' key={index}>
												{level !== 0 ? (
													findDate(status) ? (
														<i className='bi bi-check-circle-fill mr-1'></i>
													) : level >= index + 1 ? (
														<i className='bi bi-check-circle mr-1'></i>
													) : (
														<i className='bi bi-circle mr-1'></i>
													)
												) : (
													<i className='bi bi-x-circle-fill mr-1'></i>
												)}
												{status}{' '}
												{findDate(status)
													? `- ${dayjs(findDate(status)?.date).format('MMMM DD, YYYY hh:mm A')}`
													: ''}
												{request.tasks ? (
													<ul className='list-group mt-2'>
														{request.tasks
															.filter((task) => task.for === status)
															.map((task, index) => (
																<li className='list-group-item' key={index}>
																	{task.done ? (
																		<i className='bi bi-check-circle-fill mr-1'></i>
																	) : (
																		<i className='bi bi-circle mr-1'></i>
																	)}
																	{task.title}
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
								{request.evaluation !== null ? null : (
									<>
										<hr className='my-2' />
										<h6>Leave a Feedback</h6>
										<textarea
											cols={30}
											rows={4}
											className='form-control'
											onChange={(e) => {
												setFeedback(e.target.value);
											}}
											value={feedback}></textarea>
										<button
											className='btn btn-info btn-sm'
											onClick={(e) => {
												e.preventDefault();
												sendFeedback();
											}}>
											Send
										</button>
									</>
								)}
							</div>
							{request.approved ? (
								request.expired ? (
									<div className='card-footer pb-5'>
										<span className='btn btn-danger btn-sm font-weight-bold'>
											This request has expired. Please request this document again.
										</span>
									</div>
								) : (
									<div className='card-footer'>
										{request.file ? (
											<a
												href={`${request.file.url}&download=true`}
												className='btn btn-success btn-sm'
												target='_blank'
												rel='noreferrer'>
												Download Document
											</a>
										) : (
											<span>The request is approved but there is no attached document yet.</span>
										)}
									</div>
								)
							) : null}
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
			<iframe title='Print Page' id='iframe' className='d-none'></iframe>
		</div>
	);
}
