import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { CMS } from '../../contracts/CMS';
import { routes } from '../../routes';

type Props = {
	cms: Array<CMS>;
};

export function Header(props: Props) {
	const history = useHistory();
	const url = new URLSearchParams(history.location.search);
	const isPreview = url.get('preview') === 'true';
	const find = (key: string, defaultValue: string) => {
		const cms = props.cms.find((cms) => cms.key === key);
		if (cms) {
			return cms.value;
		}
		return defaultValue;
	};

	return (
		<div
			className='page-header'
			style={{
				backgroundImage: `url(${find('header-picture', '/assets/img/pup.jpg')})`,
				backgroundPosition: '50%',
				backgroundSize: 'cover',
				minHeight: '100vh',
				maxHeight: '999px',
				overflow: 'hidden',
				position: 'relative',
				width: '100%',
				zIndex: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<div className='filter'></div>
			<div className='container'>
				<div className='text-center' style={{ color: '#fff', zIndex: 3, position: 'relative' }}>
					<h1>{find('header-title', 'Welcome to PBBDTM')}</h1>
					<h3>{find('header-description', 'PUP Bansud Branch Documents Monitoring System')}</h3>
					<br />
					{!isPreview ? (
						<Link to={routes.REGISTER} className={`btn btn-outline-neutral btn-round`}>
							<i className='fa fa-play'></i> Get Started
						</Link>
					) : (
						<a href={routes.REGISTER} className={`btn btn-outline-neutral btn-round`} onClick={(e) => e.preventDefault()}>
							<i className='fa fa-play'></i> Get Started
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
