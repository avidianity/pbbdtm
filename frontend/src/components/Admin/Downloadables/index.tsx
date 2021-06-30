import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Form } from './Form';
import { List } from './List';

export function Downloadables() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url('/')} exact component={List} />
			<Route path={url('/add')} component={Form} />
		</Switch>
	);
}
