import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { routes } from '../../routes';
import { Stats } from '../Admin/Stats';
import { Requests } from '../Shared/Requests';

export function Cashier() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url('/')} exact component={Stats} />
			<Route path={url(routes.REQUESTS.ROOT)} component={Requests} />
		</Switch>
	);
}
