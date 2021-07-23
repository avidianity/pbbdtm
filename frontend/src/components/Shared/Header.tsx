import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { outIf, sentencify } from '../../helpers';
import { routes } from '../../routes';
import state from '../../state';
import toastr from 'toastr';
import { Request } from '../../contracts/Request';
import { User } from '../../contracts/User';

export function Header() {
	const [expiring, setExpiring] = useState<Request[]>([]);
	const match = useRouteMatch();

	const fragments = match.path.split('/');

	const title = sentencify(fragments[fragments.length - 1]);

	const url = (path: string) => `${match.path}${path}`;

	const history = useHistory();

	const user = state.get<User>('user');

	const logout = async () => {
		try {
			await axios.post('/auth/logout');
		} catch (error) {
			console.log(error);
		} finally {
			state.clear();
			history.push(routes.LOGIN);
			toastr.info('Logged out successfully.', 'Info');
		}
	};

	const fetchExpiring = async () => {
		try {
			const { data } = await axios.get<Request[]>(`/requests/expiring`);
			if (user.role === 'Applicant' && data.length > 0) {
				return setExpiring(Array.from(data.filter((request) => request.user_id === user.id)));
			}
			setExpiring(Array.from(data));
		} catch (error) {
			console.log(error.toJSON());
		}
	};

	useEffect(() => {
		const handle = setInterval(() => fetchExpiring(), 5000);
		return () => {
			clearInterval(handle);
		};
		// eslint-disable-next-line
	}, []);

	return (
		<nav className='navbar navbar-expand-lg navbar-absolute fixed-top navbar-transparent '>
			<div className='container-fluid bg-grad'>
				<div className='navbar-wrapper'>
					<div className='navbar-toggle'>
						<button type='button' className='navbar-toggler'>
							<span className='navbar-toggler-bar bar1'></span>
							<span className='navbar-toggler-bar bar2'></span>
							<span className='navbar-toggler-bar bar3'></span>
						</button>
					</div>
					<a className='navbar-brand' href='/' onClick={(e) => e.preventDefault()}>
						{title}
					</a>
				</div>
				<button
					className='navbar-toggler'
					type='button'
					data-toggle='collapse'
					data-target='#navigation'
					aria-controls='navigation-index'
					aria-expanded='false'
					aria-label='Toggle navigation'>
					<span className='navbar-toggler-bar navbar-kebab'></span>
					<span className='navbar-toggler-bar navbar-kebab'></span>
					<span className='navbar-toggler-bar navbar-kebab'></span>
				</button>
				<div className='collapse navbar-collapse justify-content-end' id='navigation'>
					{/* <form>
						<div className='input-group no-border'>
							<input type='text' className='form-control' placeholder='Search...' />
							<div className='input-group-append'>
								<div className='input-group-text'>
									<i className='nc-icon nc-zoom-split'></i>
								</div>
							</div>
						</div>
					</form> */}
					<ul className='navbar-nav'>
						<li className={`nav-item btn-rotate dropdown ${outIf(expiring.length === 0, 'd-none')}`}>
							<a className='nav-link dropdown-toggle' href='/' data-toggle='dropdown' aria-expanded='false'>
								<i className='nc-icon nc-bell-55'></i>
								<p>
									<span className='d-lg-none d-md-block'>Notifications</span>
								</p>
							</a>
							<div className='dropdown-menu dropdown-menu-right p-0'>
								{expiring.map((request, index) => (
									<Link
										className='dropdown-item d-flex'
										to={`${routes.DASHBOARD}${routes.REQUESTS.ROOT}/${request.id}`}
										key={index}>
										<i className='nc-icon nc-key-25 align-self-center mr-1'></i>
										<span className='align-self-center'>Request for user {request.user?.name} is about to expire.</span>
									</Link>
								))}
							</div>
						</li>
						<li className='nav-item btn-rotate dropdown'>
							<a className='nav-link dropdown-toggle' href='/' data-toggle='dropdown' aria-expanded='false'>
								<i className='nc-icon nc-circle-10'></i>
								<p>
									<span className='d-lg-none d-md-block'>Account</span>
								</p>
							</a>
							<div className='dropdown-menu dropdown-menu-right p-0' aria-labelledby='navbarDropdownMenuLink'>
								<Link to={url(routes.PROFILE)} className='dropdown-item d-flex'>
									<i className='nc-icon nc-single-02 align-self-center mr-1'></i>
									<span className='align-self-center'>Profile</span>
								</Link>
								<a
									className='dropdown-item d-flex'
									href={'/logout'}
									onClick={(e) => {
										e.preventDefault();
										logout();
									}}>
									<i className='nc-icon nc-key-25 align-self-center mr-1'></i>
									<span className='align-self-center'>Logout</span>
								</a>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
