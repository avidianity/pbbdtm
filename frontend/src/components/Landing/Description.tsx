import React from 'react';
import { CMS } from '../../contracts/CMS';

type Props = {
	cms: Array<CMS>;
};

export function Description(props: Props) {
	const find = (key: string, defaultValue: string) => {
		const cms = props.cms.find((cms) => cms.key === key);
		if (cms) {
			return cms.value;
		}
		return defaultValue;
	};

	return (
		<div className='section text-center'>
			<div className='container'>
				<div className='row'>
					<div className='col-md-8 ml-auto mr-auto'>
						<h2 className='title'>{find('description-title', "")}</h2>
						<h5 className='description text-dark'>
							{find(
								'description-paragraph',
								""
							)}
						</h5>
					</div>
				</div>
				<br />
				<br />
				<div className='row text-dark'>
					<div className='col-md-3'>
						<div className='info'>
							<div className={`icon icon-danger`}>
								<i className=''></i>
							</div>
							<div className='description'>
								<h4 className='info-title'>{find('description-card-1-title', 'Beautiful Gallery')}</h4>
								<p className='description'>
									{find(
										'description-card-1-description',
										"Spend your time generating new ideas. You don't have to think of implementing."
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-3'>
						<div className='info'>
							<div className={`icon icon-danger`}>
								<i className=''></i>
							</div>
							<div className='description'>
								<h4 className='info-title'>{find('description-card-2-title', 'New Ideas')}</h4>
								<p>
									{find(
										'decsription-card-2-description',
										'Larger, yet dramatically thinner. More powerful, but remarkably power efficient.'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-3'>
						<div className='info'>
							<div className={`icon icon-danger`}>
								<i className=''></i>
							</div>
							<div className='description'>
								<h4 className='info-title'>{find('description-card-3-title', 'Statistics')}</h4>
								<p>
									{find(
										'description-card-3-description',
										'Choose from a veriety of many colors resembling sugar paper pastels.'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-3'>
						<div className='info'>
							<div className={`icon icon-danger`}>
								<i className=''></i>
							</div>
							<div className='description'>
								<h4 className='info-title'>{find('description-card-4-title', 'Delightful design')}</h4>
								<p>
									{find(
										'description-card-4-description',
										'Find unique and handmade delightful designs related items directly from our sellers'
									)}
									.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
