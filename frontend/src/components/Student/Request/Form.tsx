import axios from 'axios';
import React, { ChangeEvent, createRef, RefObject, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';
import { Request } from '../../../contracts/Request';
import state from '../../../state';
import { User } from '../../../contracts/User';
import { DocumentType } from '../../../contracts/DocumentType';

export function Form() {
	const [processing, setProcessing] = useState(true);
	const [data, setData] = useState<any>({
		document_type_id: -1,
		approved: false,
		status: 'Received',
		user_id: state.get<User>('user').id,
		copies: 1,
		reason: '',
		acknowledged_dates: JSON.stringify([]),
	});
	const [refs, setRefs] = useState<RefObject<HTMLInputElement>[]>([]);
	const [files, setFiles] = useState<(File | null)[]>([]);
	const [types, setTypes] = useState<Array<DocumentType>>([]);

	const history = useHistory();

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setData({
			...data,
			[id]: value,
		});
	};

	const fetchTypes = async () => {
		try {
			const response = await axios.get<Array<DocumentType>>('/document-types');
			if (response.data.length === 0) {
				toastr.info('There are no available documents that you can request right now. Please try again later.', 'Notice');
				return history.goBack();
			}
			setTypes(response.data);
			setData({ ...data, document_type_id: response.data[0].id as number });
			setProcessing(false);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to connect to server. Please try again later.');
			history.goBack();
		}
	};

	useEffect(() => {
		fetchTypes();
		// eslint-disable-next-line
	}, []);

	const user = state.get<User>('user');

	const createTask = async (title: string, request: Request) => {
		try {
			await axios.post(`/requests/tasks`, {
				for: 'Received',
				title,
				request_id: request.id,
				done: false,
				name: user.name,
			});
		} catch (error) {
			console.log(error.toJSON());
		}
	};

	const submit = async () => {
		if (processing) return;
		setProcessing(true);
		try {
			const payload = new FormData();

			for (const key in data) {
				payload.append(key, data[key]);
			}

			files.filter((file) => file instanceof File).forEach((file) => payload.append('files[]', file!));

			const { data: request } = await axios.post<Request>('/requests', payload);

			if (request.documentType) {
				await Promise.all(
					Array.from<string>(JSON.parse((request.documentType?.requirements as any) || '[]')).map((requirement) =>
						createTask(requirement, request)
					)
				);
			}

			setFiles([]);
			toastr.success('Request created successfully.');
		} catch (error) {
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<form
			className='container text-yellow'
			onSubmit={async (e) => {
				e.preventDefault();
				await submit();
			}}>
			<div className='d-flex'>
				<h3 className='align-self-center mb-0 text-yellow'>Create Request</h3>
				<button
					className='btn btn-info btn-sm align-self-center ml-auto'
					onClick={(e) => {
						e.preventDefault();
						history.goBack();
					}}>
					Back
				</button>
			</div>
			<div className='form-group text-yellow'>
				<label htmlFor='document_type_id'>Document Type</label>
				<select
					name='document_type_id'
					id='document_type_id'
					className='form-control form-control-sm'
					onChange={handleChange}
					value={data.document_type_id}>
					{types.map((type, index) => (
						<option key={index} value={type.id}>
							{type.name}
						</option>
					))}
				</select>
			</div>
			<div className='form-group'>
				<label htmlFor='copies '>Copies</label>
				<input
					type='number'
					name='copies'
					id='copies'
					placeholder='Copies'
					className='form-control form-control-sm'
					onChange={handleChange}
					value={data.copies}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='reason'>Reason</label>
				<select
					name='reason'
					id='reason'
					placeholder='Reason'
					className='form-control form-control-sm'
					onChange={handleChange}
					value={data.reason}
				>
					<option key="For Board Examination" value="For Board Examination">
							For Board Examination
					</option>
					<option key="For Employment" value="For Employment">
							For Employment
					</option>
					<option key="For Scholarship" value="For Scholarship">
							For Scholarship
					</option>
					<option key="For Studies" value="For Studies">
							For Studies
						</option>
						
				</select>
			</div>
			<div className='container-fluid'>
				<h6>Requirements</h6>
				{((requirements) => {
					if (!requirements) {
						return [];
					}
					try {
						const data = JSON.parse(requirements as any);
						if (!data) {
							return [];
						}
						return data as string[];
					} catch (error) {
						console.log(error.toJSON());
						return [];
					}
				})(types.find((type) => Number(type.id) === Number(data.document_type_id))?.requirements || '').map(
					(requirement, index) => (
						<p key={index}>{requirement}</p>
					)
				)}
				<h6>Compliance</h6>
				<div className='container'>
					<div className='row'>
						<div className='col-12'>
							<button
								className='btn btn-info btn-sm'
								onClick={(e) => {
									e.preventDefault();
									refs.push(createRef());
									setRefs([...refs]);
									files.push(null);
									setFiles([...files]);
								}}>
								Add File
							</button>
						</div>
						{refs.map((ref, index) => (
							<div className='col-12 col-md-4 col-lg-3 col-xl-2 p-2 border rounded' key={index}>
								<p>{files[index] ? files[index]?.name : ''}</p>
								<button
									className={`btn ${files[index] === null ? 'btn-secondary' : 'btn-danger'} btn-sm`}
									onClick={(e) => {
										e.preventDefault();
										if (files[index] === null) {
											ref.current?.click();
										} else {
											files.splice(index, 1);
											setFiles([...files]);
											refs.splice(index, 1);
											setRefs([...refs]);
										}
									}}>
									{files[index] === null ? 'Upload' : 'Remove'}
								</button>
								<input
									ref={ref}
									type='file'
									className='d-none'
									onChange={(e) => {
										if (e.target.files && e.target.files.length > 0) {
											files.splice(index, 1, e.target.files[0]);
											setFiles([...files]);
										}
									}}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
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
