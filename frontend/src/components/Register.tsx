import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { User } from '../contracts/User';
import { handleError, makeMask, outIf } from '../helpers';
import { routes } from '../routes';
import state from '../state';
import styles from '../styles/Login.module.css';
import toastr from 'toastr';
import InputMask from 'react-input-mask';

type Response = {
	user: User;
	token: string;
};

export function Register() {
	const [data, _setData] = useState({
		name: '',
		email: '',
		phone: '09',
		password: '',
		password_confirmation: '',
		type: 'Client',
		student_id_number: '',
	});
	const [processing, setProcessing] = useState(false);

	const setData = makeMask(_setData, (data: any) => ({ ...data }));

	const history = useHistory();

	if (state.has('logged') && state.get<boolean>('logged')) {
		history.push(routes.DASHBOARD);
	}

	const submit = async () => {
		if (data.password !== data.password_confirmation) {
			return toastr.error('Password and Confirm Password does not match.', 'Oops!');
		}

		if (data.type === 'Student') {
			if (!/\d{4}-\d{5}-[A-Z]{2}-\d{1}/g.test(data.student_id_number)) {
				return toastr.error('Student ID Number is not in correct format.');
			}
			const year = data.student_id_number.split('-')[0];
			if (Number(year) >= new Date().getUTCFullYear()) {
				return toastr.error('Student ID Number is invalid.');
			}
		}

		setProcessing(true);
		try {
			const response = await axios.post<Response>('/auth/register', data);

			const { user, token } = response.data;

			state.set('logged', true);
			state.set('user', user);
			state.set('token', token);
			history.push(routes.DASHBOARD);
		} catch (error) {
			handleError(error);
			console.log(error);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className={`w-100 h-100vh d-flex ${styles.body}`}>
			<div className='align-self-center mx-auto'>
				<div className={`card shadow ${styles.card}`}>
					<div className='card-header text-center'>
						<img
							src='/assets/manifest-icon-512.png'
							alt='Logo'
							className='img-fluid hw-max-75 rounded-circle clickable'
							onClick={(e) => {
								e.preventDefault();
								history.push(routes.ROOT);
							}}
						/>
						<h2 className='card-title'>
							<Link to={routes.ROOT} style={{ textDecoration: 'none' }}>
								PBBDTM
							</Link>
						</h2>
						<p className='card-text'>🍀 New here? Please fill in the required information.</p>
					</div>
					<div className='card-body'>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								submit();
							}}>
							<div className='form-group'>
								<label htmlFor='name'>Name</label>
								<input
									type='text'
									name='name'
									id='name'
									placeholder='John Smith'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.name}
									onChange={(e) => {
										data.name = e.target.value;
										setData(data);
									}}
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='email'>Email</label>
								<input
									type='email'
									name='email'
									id='email'
									placeholder='email@dtms.com'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.email}
									onChange={(e) => {
										data.email = e.target.value;
										setData(data);
									}}
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='phone'>Phone</label>
								<InputMask
									mask='0\9999999999'
									type='text'
									name='phone'
									id='phone'
									placeholder='639123456789'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.phone}
									onChange={(e) => {
										data.phone = e.target.value;
										setData(data);
									}}
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
									onChange={(e) => {
										data.password = e.target.value;
										setData(data);
									}}
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='password_confirmation'>Confirm Password</label>
								<input
									type='password'
									name='password_confirmation'
									id='password_confirmation'
									placeholder='Password'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.password_confirmation}
									onChange={(e) => {
										data.password_confirmation = e.target.value;
										setData(data);
									}}
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='Type'>Type</label>
								<select
									name='type'
									id='type'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.type}
									onChange={(e) => {
										data.type = e.target.value;
										setData(data);
									}}>
									<option value='Client'>Client</option>
									<option value='Student'>Student</option>
								</select>
							</div>
							{data.type === 'Student' ? (
								<div className='form-group'>
									<label htmlFor='student_id_number'>Student ID Number:</label>
									<input
										type='text'
										name='student_id_number'
										id='student_id_number'
										placeholder='Student ID Number'
										className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
										disabled={processing}
										value={data.student_id_number}
										onChange={(e) => {
											data.student_id_number = e.target.value;
											setData(data);
										}}
									/>
									<small className='form-text text-muted'>Ex: 2020-00001-BS-0</small>
								</div>
							) : null}
							<div className='form-group'>
								<button
									type='submit'
									className={`btn btn-sm btn-secondary ${outIf(processing, 'disabled')}`}
									disabled={processing}>
									{processing ? (
										<div className='spin'>
											<i className='bi bi-arrow-clockwise'></i>
										</div>
									) : (
										'Register'
									)}
								</button>
							</div>
							<div className='form-group'>
								Already have an account?{' '}
								<Link to={routes.LOGIN} className='d-inline'>
									Login
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
