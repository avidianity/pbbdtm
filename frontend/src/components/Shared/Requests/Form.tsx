import axios from 'axios';
import React, { ChangeEvent, createRef, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { statuses } from '../../../constants';
import { Request } from '../../../contracts/Request';
import { User } from '../../../contracts/User';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';
import state from '../../../state';

export function Form() {
	const [processing, setProcessing] = useState(false);
	const user = state.get<User>('user');
	const [data, setData] = useState<any>({
		document_type_id: -1,
		approved: false,
		status: 'Received',
		user_id: user.id,
		file_id: null,
		user: {
			name: user.role === 'Applicant' ? user.name : 'N\\A',
		},
		documentType: {
			name: 'N\\A',
		},
		acknowledged_dates: JSON.stringify([]),
	});
	const [file, setFile] = useState<File | null>(null);

	const fileRef = createRef<HTMLInputElement>();

	const history = useHistory();

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setData({
			...data,
			[id]: value,
		});
	};

	const { params, path } = useRouteMatch<{ id: string }>();

	const fetchRequest = async () => {
		const id = params.id;
		try {
			const response = await axios.get(`/requests/show?id=${id}`);
			setData({
				...response.data,
				file: null,
			});
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch request.');
			history.goBack();
		}
	};

	useEffect(() => {
		if (path.includes('edit')) {
			fetchRequest();
		}
		// eslint-disable-next-line
	}, []);

	const submit = async () => {
		if (processing) return;
		setProcessing(true);
		try {
			const payload = new FormData();
			payload.append('_method', 'PUT');

			if (file) {
				data.file = file;
			}

			for (const key of ['documentType', 'logs', 'files', 'tasks', 'user', 'evaluation', 'expired']) {
				delete data[key];
			}

			for (const key in data) {
				const value = data[key];
				payload.append(key, value);
			}

			await axios.post<Request>('/requests', payload);
			toastr.success('Request updated successfully.');
			setFile(null);
		} catch (error) {
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	const getUserStatusables = (): Array<RequestStatus> => {
		switch (user.role) {
			case 'Admin':
				return ['Received', 'Payment', 'Evaluating', 'Evaluated', 'Signed', 'Releasing', 'Released'];
			case 'Registrar':
				return ['Received', 'Payment', 'Evaluating', 'Evaluated', 'Signed', 'Releasing', 'Released'];
			case 'Director':
				return ['Received', 'Payment', 'Evaluating', 'Evaluated', 'Signed', 'Releasing', 'Released'];
			case 'Cashier':
				return ['Payment', 'Evaluating'];
			case 'Evaluation':
				return ['Signed', 'Released'];
			case 'Releasing':
				return ['Releasing', 'Released'];
			default:
				return [];
		}
	};

	const statusables = getUserStatusables();

	return (
		<form
			className='container'
			onSubmit={async (e) => {
				e.preventDefault();
				await submit();
			}}>
			<div className='d-flex'>
				<h3 className='align-self-center mb-0'>Update Request</h3>
				<button
					className='btn btn-info btn-sm align-self-center ml-auto'
					onClick={(e) => {
						e.preventDefault();
						history.goBack();
					}}>
					Back
				</button>
			</div>
			<div className='form-group'>
				<label htmlFor='document_type_id'>Document Type</label>
				<select
					name='document_type_id'
					id='document_type_id'
					className='form-control form-control-sm'
					disabled={user.role !== 'Applicant'}>
					<option value={data.documentType?.name}>{data.documentType?.name}</option>
				</select>
			</div>
			<div className='form-group'>
				<label htmlFor='user_id'>User</label>
				<select
					name='user_id'
					id='user_id'
					placeholder='User'
					className='form-control form-control-sm'
					disabled={user.role !== 'Applicant'}>
					<option value={data.user?.name}>{data.user?.name}</option>
				</select>
			</div>
			<div className='form-group'>
				<label htmlFor='status'>Status</label>
				<select
					name='status'
					id='status'
					placeholder='Status'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					onChange={handleChange}
					value={data.status}>
					<option value=''> -- Select -- </option>
					{statuses
						.filter((status) => statusables.includes(status))
						.map((status, index) => (
							<option value={status} key={index}>
								{status}
							</option>
						))}
				</select>
			</div>
			<div className='form-group'>
				<label htmlFor='approved'>Approved</label>
				<select
					name='approved'
					id='approved'
					placeholder='Approved'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing || (user.role !== 'Admin' && user.role !== 'Releasing')}
					value={data.approved ? 'Yes' : 'No'}
					onChange={(e) => {
						if (user.role === 'Admin' || user.role === 'Releasing') {
							if (e.target.value === 'Yes') {
								setData({
									...data,
									approved: true,
								});
							} else {
								setData({
									...data,
									approved: false,
								});
							}
						}
					}}>
					<option value='Yes'>Yes</option>
					<option value='No'>No</option>
				</select>
			</div>
			{data.approved ? (
				<div className='form-group'>
					<button
						className={`btn btn-warning btn-sm ${outIf(processing || file !== null, 'disabled')}`}
						disabled={processing || (user.role !== 'Admin' && user.role !== 'Releasing') || file !== null}
						onClick={(e) => {
							e.preventDefault();
							fileRef.current?.click();
						}}>
						{file !== null ? 'File Uploaded' : 'Upload File (if applicable)'}
					</button>
					<input
						type='file'
						id='file'
						name='file'
						placeholder='File'
						className={`form-control form-control-sm d-none`}
						disabled={processing || (user.role !== 'Admin' && user.role !== 'Releasing') || file !== null}
						onChange={(e) => {
							if ((user.role === 'Admin' || user.role === 'Releasing') && e.target.files && e.target.files.length > 0) {
								setFile(e.target.files[0]);
							}
						}}
						ref={fileRef}
					/>
				</div>
			) : null}
			<div className='form-group'>
				<button type='submit' className={`btn btn-primary btn-sm ${outIf(processing, 'disabled')}`} disabled={processing}>
					{processing ? (
						<div className='spin'>
							<i className='bi bi-arrow-clockwise'></i>
						</div>
					) : (
						'Save'
					)}
				</button>
			</div>
		</form>
	);
}
