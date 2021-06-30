import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Downloadable } from '../../contracts/Downloadable';

export function Downloadables() {
	const [downloadables, setDownloadables] = useState<Array<Downloadable>>([]);

	const fetchDownloadables = async () => {
		try {
			const { data } = await axios.get('/downloadables');
			setDownloadables([...data]);
		} catch (error) {
			console.log(error.toJSON());
		}
	};

	const categories = {} as { [key: string]: Downloadable[] };

	downloadables.forEach((downloable) => {
		if (!(downloable.category! in categories)) {
			categories[downloable.category!] = [];
		}

		categories[downloable.category!].push(downloable);
	});

	useEffect(() => {
		fetchDownloadables();
		// eslint-disable-next-line
	}, []);

	return downloadables.length > 0 ? (
		<div className='section landing-section'>
			<div className='container'>
				<div className='row'>
					<div className='col-md-8 mx-auto text-center'>
						<h3 className='mb-3'>Downloadables</h3>
						<ul className='list-group'>
							{Object.entries(categories).map(([category, downloadables], index) => (
								<li className='list-group-item' key={index}>
									{category}
									<ul className='list-group'>
										{downloadables.map((downloadable, index) => (
											<li className='list-group-item' key={index}>
												<a className='btn btn-link' href={downloadable.file!.url}>
													{downloadable.name}
												</a>
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	) : null;
}
