import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { routes } from '../../routes';
import { Requests } from '../Shared/Requests';
import { CMS } from './CMS';
import { Contacts } from './Contacts';
import { DocumentTypes } from './DocumentTypes';
import { Downloadables } from './Downloadables';
import { Stats } from './Stats';
import { Users } from './Users/index';

export function Admin() {
	const match = useRouteMatch();

	const url = (path: string) => `${match.path}${path}`;

	return (
		<Switch>
			<Route path={url('/')} exact component={Stats} />
			<Route path={url(routes.USERS)} component={Users} />
			<Route path={url(routes.DOCUMENT_TYPES)} component={DocumentTypes} />
			<Route path={url(routes.REQUESTS.ROOT)} component={Requests} />
			<Route path={url(routes.DOWNLOADABLES)} component={Downloadables} />
			<Route path={url(routes.CMS)} component={CMS} />
			<Route path={url(routes.CONTACTS)} component={Contacts} />
		</Switch>
	);
}
