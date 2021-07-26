import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { outIf } from '../../helpers';
import { routes } from '../../routes';

export function AdminSidebar() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	const links = [
		{
			url: routes.DASHBOARD,
			icon: 'nc-icon nc-bank',
			title: 'Dashboard',
		},
		{
			url: url(routes.DOCUMENT_TYPES),
			icon: 'nc-icon nc-book-bookmark',
			title: 'Document Types',
		},
		{
			url: url(routes.REQUESTS.ROOT),
			icon: 'nc-icon nc-tag-content',
			title: 'Requests',
		},
		{
			url: url(`${routes.REQUESTS.ROOT}${routes.REQUESTS.INACTIVE}`),
			icon: 'nc-icon nc-calendar-60',
			title: 'Inactive Requests',
		},
		{
			url: url(`${routes.REQUESTS.ROOT}${routes.REQUESTS.ARCHIVED}`),
			icon: 'nc-icon nc-box-2',
			title: 'Repository',
		},
		{
			url: url(routes.USERS),
			icon: 'nc-icon nc-single-02',
			title: 'Users',
		},
		{
			url: url(routes.CMS),
			icon: 'nc-icon nc-layout-11',
			title: 'Customization',
		},
		{
			url: url(routes.CONTACTS),
			icon: 'nc-icon nc-single-copy-04',
			title: 'Contacts',
		},
	];

	return (
		<div className='sidebar-wrapper bg-maroon' style={{ overflowX: 'hidden' }}>
			<ul className='nav'>
				{links.map((link, index) => (
					<li className={outIf(link.url === window.location.pathname, 'active')}  key={index}>
						<Link to={link.url}>
							<i className= {link.icon} ></i>
							<p>{link.title}</p>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
