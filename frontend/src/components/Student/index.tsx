import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { routes } from '../../routes';
import { Requests } from './Request';

export function Applicant() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url(routes.REQUESTS.ROOT)} component={Requests} />
		</Switch>
	);
}
