import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { User } from '../contracts/User';
import { handleError, outIf } from '../helpers';
import { routes } from '../routes';
import state from '../state';
import styles from '../styles/Login.module.css';
import toastr from 'toastr';

type Response = {
	user: User;
	token: string;
};

export function Login() {
	const [data, setData] = useState({
		email: '',
		password: '',
	});
	const [processing, setProcessing] = useState(false);

	const history = useHistory();

	if (state.has('logged') && state.get<boolean>('logged') && state.get('user')) {
		history.push(routes.DASHBOARD);
	}

	const submit = async () => {
		if (data.password.length === 0) {
			return toastr.error('Please provide a password.');
		}
		setProcessing(true);
		try {
			const response = await axios.post<Response>('/auth/login', data);

			const { user, token } = response.data;

			state.set('logged', true);
			state.set('user', user);
			state.set('token', token);
			console.log(state.getAll(), 'all');
			history.push(routes.DASHBOARD);
		} catch (error) {
			handleError(error);
			console.log(error);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className={`w-100 h-100vh d-flex bg-vgrad ${styles.body}`}>
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
								PUP Bansud Branch
							</Link>
						</h2>
						<p className='card-text'>Documents Monitoring System</p>
					</div>
					<div className='card-body'>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								submit();
							}}>
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
										setData({ ...data });
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
										setData({ ...data });
									}}
								/>
							</div>
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
										'Login'
									)}
								</button>
							</div>
							<div className='form-group'>
								Don't have an account?{' '}
								<Link to={routes.REGISTER} className='d-inline'>
									Register
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
