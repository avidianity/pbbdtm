import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { outIf } from '../../helpers';
import { routes } from '../../routes';

export function ApplicantSidebar() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	const links = [
		{
			url: routes.DASHBOARD,
			icon: 'nc-icon nc-bank',
			title: 'Dashboard',
		},
		{
			url: url(routes.REQUESTS.ROOT),
			icon: 'nc-icon nc-tag-content',
			title: 'Requests',
		},
	];

	return (
		<div className='sidebar-wrapper' style={{ overflowX: 'hidden' }}>
			<ul className='nav'>
				{links.map((link, index) => (
					<li className={outIf(link.url === window.location.pathname, 'active')} key={index}>
						<Link to={link.url}>
							<i className={link.icon}></i>
							<p>{link.title}</p>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
