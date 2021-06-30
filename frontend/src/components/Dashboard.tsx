import React from 'react';
import { Link, useHistory, Route, useRouteMatch } from 'react-router-dom';
import { User } from '../contracts/User';
import { orEqual } from '../helpers';
import { routes } from '../routes';
import state from '../state';
import { Admin } from './Admin';
import { AdminSidebar } from './Admin/Sidebar';
import { Cashier } from './Cashier';
import { CashierSidebar } from './Cashier/Sidebar';
import { Profile } from './Profile';
import { Footer } from './Shared/Footer';
import { Header } from './Shared/Header';
import { Applicant } from './Student';
import { ApplicantSidebar } from './Student/Sidebar';

export function Dashboard() {
	const history = useHistory();
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	if ((!state.has('logged') && !state.get('logged')) || state.get('user') === undefined) {
		history.push(routes.LOGIN);
		return null;
	}

	const user = state.get<User>('user');

	return (
		<div className='wrapper bg-yellow'>
			<div className='sidebar bg-maroon' data-color='white' data-active-color='danger'>
				<div className='logo bg-maroon'>
					<Link to={routes.DASHBOARD} className='simple-text logo-mini'>
						<img src='/assets/manifest-icon-512.png' alt='Logo' className='rounded-circle' />
					</Link>
					<Link to={routes.DASHBOARD} className='logo-normal text-warning bg-maroon'>
						<h5>PUPBBDMS</h5>
					</Link>
				</div>
				{user.role === 'Admin' ? <AdminSidebar /> : null}
				{orEqual(user.role, ['Processing', 'Cashier', 'Evaluation', 'Signing', 'Releasing', 'Director', 'Registrar']) ? (
					<CashierSidebar />
				) : null}
				{user.role === 'Applicant' ? <ApplicantSidebar /> : null}
			</div>
			<div className='main-panel h-100 bg-yellow'>
				<Header />
				<div className='content bg-yellow'>
					<Route path={url(routes.PROFILE)} exact component={Profile} />
					{user.role === 'Admin' ? <Admin /> : null}
					{orEqual(user.role, ['Processing', 'Cashier', 'Evaluation', 'Signing', 'Releasing', 'Director', 'Registrar']) ? (
						<Cashier />
					) : null}
					{user.role === 'Applicant' ? <Applicant /> : null}
				</div>
				<Footer />
			</div>
		</div>
	);
}
