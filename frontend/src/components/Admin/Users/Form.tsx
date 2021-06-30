import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { User } from '../../../contracts/User';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';

export function Form() {
	const [processing, setProcessing] = useState(false);
	const [mode, setMode] = useState('Add');
	const [data, setData] = useState<User>({
		id: -1,
		name: '',
		email: '',
		password: '',
		role: 'Applicant',
		phone: '63',
	});

	const history = useHistory();

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setData({
			...data,
			[id]: value,
		});
	};

	const reset = () => setData({ name: '', email: '', password: '', role: data.role, id: -1, phone: '63' });

	const submit = async () => {
		if (processing) return;
		setProcessing(true);
		try {
			await (mode === 'Add' ? axios.post<User>('/users', data) : axios.put<User>('/users', data));
			toastr.success('User saved successfully.');
			if (mode === 'Add') {
				reset();
			}
		} catch (error) {
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	const fetchUser = async (userID: string) => {
		setMode('Edit');
		try {
			const { data } = await axios.get<User>(`/users/show?id=${userID}`);
			data.password = '';
			setData(data);
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	const { params, path } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		if (path.includes('edit')) {
			fetchUser(params.id);
		}
		// eslint-disable-next-line
	}, []);

	return (
		<form
			className='container'
			onSubmit={async (e) => {
				e.preventDefault();
				await submit();
			}}>
			<div className='d-flex'>
				<h3 className='align-self-center mb-0'>{mode} User</h3>
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
				<label htmlFor='name'>Name</label>
				<input
					type='text'
					name='name'
					id='name'
					placeholder='Name'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.name}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='email'>Email</label>
				<input
					type='email'
					name='email'
					id='email'
					placeholder='Email'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.email}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='phone'>Phone</label>
				<input
					type='text'
					name='phone'
					id='phone'
					placeholder='Phone'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.phone}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='password'>Password</label>
				<input
					type='password'
					name='password'
					id='password'
					placeholder='Password'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.password}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='role'>Role</label>
				<select name='role' id='role' className='form-control form-control-sm' value={data.role} onChange={handleChange}>
					{['Admin', 'Processing', 'Cashier', 'Evaluation', 'Director', 'Registrar', 'Releasing', 'Applicant'].map(
						(role, index) => (
							<option value={role} key={index}>
								{role}
							</option>
						)
					)}
				</select>
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
