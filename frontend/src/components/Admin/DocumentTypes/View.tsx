import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DocumentType } from '../../../contracts/DocumentType';
import { handleError } from '../../../helpers';

export function View() {
	const [documentType, setDocumentType] = useState<DocumentType | null>(null);
	const history = useHistory();

	const fetchDocumentType = async (documentTypeID: string) => {
		try {
			const { data } = await axios.get(`/document-types/show?id=${documentTypeID}`);
			setDocumentType({
				...data,
				requirements: ((requirements) => {
					if (!requirements) {
						return [];
					}
					try {
						const data = JSON.parse(requirements as any);
						if (!data) {
							return [];
						}
						return data;
					} catch (error) {
						console.log(error.toJSON());
						return [];
					}
				})(data.requirements),
			});
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	const { params } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		fetchDocumentType(params.id);
		// eslint-disable-next-line
	}, []);
	return (
		<div className='container'>
			<div className='row'>
				<div className='col-12'>
					<h3 className='mb-0'>View Document Type</h3>
				</div>
				<div className='col-12'>
					<button
						className='btn btn-info btn-sm'
						onClick={(e) => {
							e.preventDefault();
							history.goBack();
						}}>
						Back
					</button>
				</div>
				<div className='col-12'>
					{documentType ? (
						<div className='card shadow rounded'>
							<div className='card-body'>
								<h6>Name</h6>
								<p>{documentType.name}</p>
								<h6>Requirements</h6>
								{documentType.requirements?.map((requirement, index) => (
									<p className='card-text' key={index}>
										{requirement}
									</p>
								))}
								<h6>Forms</h6>
								{documentType.files?.map((file, index) => (
									<p className='card-text' key={index}>
										<a href={`${file.file?.url}&download=true`} target='_blank' rel='noreferrer'>
											{file.file?.name}
										</a>
									</p>
								))}
							</div>
						</div>
					) : (
						<div className='d-flex h-100 w-100'>
							<div className='align-self-center mx-auto'>
								<i className='fas fa-circle-notch fa-spin fa-2x'></i>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
