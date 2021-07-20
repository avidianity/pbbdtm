import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { routes } from './routes';
import '@fortawesome/fontawesome-free/css/all.css';
import axios from 'axios';
import { User } from './contracts/User';
import state from './state';
import Track from './components/Landing/Track';
import { View } from './components/Student/Request/View';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
	const verifyUser = async () => {
		try {
			const { data } = await axios.get<User>('/self');
			state.set('logged', true);
			state.set('user', data);
		} catch (error) {
			console.log(error.toJSON());
			state.remove('user').set('logged', false);
		}
	};

	useEffect(() => {
		verifyUser();
		// eslint-disable-next-line
	}, []);

	return (
		<Router>
			<Switch>
				<Route path={routes.ROOT} exact component={Landing} />
				<Route path={routes.LOGIN} component={Login} />
				<Route path={routes.REGISTER} component={Register} />
				<Route path={routes.DASHBOARD} component={Dashboard} />
				<Route path={routes.TRACK_REQUEST} exact component={Track} />
				<Route path={`${routes.TRACK_REQUEST}/:id`} component={View} />
				<Route path={routes.FORGOT_PASSWORD} component={ForgotPassword} />
				<Route path={`${routes.RESET_PASSWORD}/:token`} component={ResetPassword} />
			</Switch>
		</Router>
	);
}
