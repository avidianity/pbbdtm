import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { routes } from '../../../routes';
import Archived from './Archived';
import { Form } from './Form';
import Inactive from './Inactive';
import { List } from './List';
import { View } from './View';

export function Requests() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url('/')} exact component={List} />
			<Route path={url(routes.REQUESTS.INACTIVE)} component={Inactive} />
			<Route path={url(routes.REQUESTS.ARCHIVED)} component={Archived} />
			<Route path={url('/add')} component={Form} />
			<Route path={url('/:id')} exact component={View} />
			<Route path={url('/:id/edit')} component={Form} />
		</Switch>
	);
}
