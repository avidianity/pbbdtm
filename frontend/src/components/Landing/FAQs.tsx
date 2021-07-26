import React from 'react';
import { CMS } from '../../contracts/CMS';
import Item from './FAQ/Item';

type Props = {
	cms: Array<CMS>;
};

export function FAQs(props: Props) {
	const find = (key: string, defaultValue: string) => {
		const cms = props.cms.find((cms) => cms.key === key);
		if (cms) {
			return cms.value;
		}
		return defaultValue;
	};

	const faqs = JSON.parse(find('faqs', JSON.stringify([]))) as Array<FAQ>;

	const chunks: Array<Array<FAQ>> = [[]];

	faqs.forEach((faq) => {
		const last = chunks[chunks.length - 1];
		if (last.length < 2) {
			last.push(faq);
			chunks.splice(chunks.length - 1, 1, last);
		} else {
			chunks.push([faq]);
		}
	});

	return (
		<div className='section landing-section'>
			<div className='container'>
				<div className='row'>
					<div className='col-md-8 mx-auto justify-content-center'>
						<h2 className='col-md-8 ml-auto mr-auto text-center justify-content-center'><b>FAQs</b></h2>
						{chunks.map((faqs, index) => (
							<div className='card-group' key={index}>
								{faqs.map((faq, index) => (
									<div className='card m-1 border-0 shadow rounded' key={index}>
										<div className='card-header d-flex'>
											<h3 className='card-title mb-0 align-self-center' style={{ color: '#000' }}>
												<b>{faq.question}</b>
											</h3>
										</div>
										<Item answer={faq.answer} />
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
