import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Form } from './Form';
import { List } from './List';
import { View } from './View';

export function Requests() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url('/')} exact component={List} />
			<Route path={url('/add')} component={Form} />
			<Route path={url('/:id')} component={View} />
		</Switch>
	);
}
