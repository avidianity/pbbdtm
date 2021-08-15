import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import _ from 'lodash';
import { outIf, sentencify } from '../../helpers';
import { State } from '../../state';
import Datatable from 'react-data-table-component';

type Props<T> = {
	id?: string;
	title: string;
	theme?: 'light' | 'dark';
	columns?: Array<string>;
	data: Array<T>;
	onViewClick: (data: T) => void;
	onEditClick: (data: T) => void;
	onRefreshClick: () => void;
	onAddClick: () => void;
	onDeleteConfirm: (data: T) => void;
	processing: boolean;
	withAction: boolean;
	pagination: boolean;
	border?: boolean;
	dontShowDelete?: boolean;
	dontShowEdit?: boolean;
	dontShowView?: boolean;
	disableAddButton?: boolean;
};

export function Table<T>({
	title,
	data,
	onViewClick,
	onEditClick,
	onDeleteConfirm,
	onRefreshClick,
	processing,
	onAddClick,
	withAction,
	pagination,
	border,
	dontShowView,
	dontShowEdit,
	dontShowDelete,
	disableAddButton,
	id,
}: Props<T>) {
	const state = new State(_.kebabCase(title.toLowerCase() + '-table'));

	const total = data.length;
	const page = state.has('page') ? state.get('page') : 1;

	const [interval, setInterval] = useState(state.has('perPage') ? state.get<number>('perPage') : 10);
	if (page > Math.ceil(total / interval) && state.has('page')) {
		state.set('page', 1);
	}
	const [current, setCurrent] = useState(page <= Math.ceil(total / interval) ? page : 1);
	const pageKey = state.listen<number>('page', (page) => setCurrent(page));
	const [formInterval, setFormInterval] = useState(interval);
	const [options, setOptions] = useState(false);

	const intervalKey = state.listen<number>('perPage', (perPage) => {
		if (current > Math.ceil(total / perPage)) {
			state.set('page', 1);
		}
		setInterval(perPage);
	});

	useEffect(
		() => () => {
			state.unlisten('page', pageKey);
			state.unlisten('perPage', intervalKey);
		},
		// eslint-disable-next-line
		[]
	);

	const offset = (current - 1) * interval;

	const paginatedData: Array<any> = [];

	for (let count = offset; count < offset + interval; count++) {
		if (typeof data[count] !== 'undefined') {
			paginatedData.push(data[count]);
		}
	}

	const columns =
		data.length > 0
			? Object.keys(data[0]).map((column) => ({
					name: sentencify(column),
					selector: ((row: any) => row[column]) as any,
					sortable: true,
					minWidth: '200px',
			  }))
			: [];

	if (withAction) {
		columns.push({
			name: 'Actions',
			selector: (row: any) => row['action'],
			sortable: true,
			minWidth: '300px',
		});
	}

	return (
		<div className='row' id={id}>
			<div className='col-12'>
				<div className={`card ${border ? 'border' : ''} w-100`}>
					<div className='card-header border-0'>
						<div className='d-flex'>
							<h3 className='mb-0 align-self-center'>{title}</h3>
							<div className='ml-auto align-self-center d-flex'>
								{withAction && (disableAddButton === undefined || disableAddButton === false) ? (
									<i
										className={`fas fa-plus clickable d-block align-self-center m-1 text-warning`}
										onClick={() => onAddClick()}></i>
								) : null}
								{withAction ? (
									<i
										className={`fas fa-redo-alt clickable d-block align-self-center m-1 text-info ${
											processing ? 'fa-spin' : ''
										}`}
										onClick={() => onRefreshClick()}></i>
								) : null}
							</div>
						</div>
						{pagination ? (
							<div className='mt-4'>
								<div className='py-2'>
									<button
										className={`btn btn-${!options ? 'primary' : 'danger'} btn-sm d-none`}
										onClick={(e) => {
											e.preventDefault();
											setOptions(!options);
										}}>
										{!options ? 'Show' : 'Hide'} Options
									</button>
								</div>
								{options ? (
									<form
										className='form-inline d-none'
										onSubmit={(e) => {
											e.preventDefault();
											state.set('perPage', formInterval >= 1 ? formInterval : 10);
										}}>
										<div className='form-group p-1'>
											<label htmlFor='perPage' className='mr-2'>
												Rows per Page:
											</label>
											<input
												type='number'
												name='perPage'
												id='perPage'
												placeholder='Per Page'
												value={formInterval}
												onChange={(e) => setFormInterval(Number(e.target.value))}
												className='form-control form-control-sm'
											/>
										</div>
										<div className='form-group p-1'>
											<button type='submit' className='btn btn-warning btn-sm'>
												Change
											</button>
										</div>
									</form>
								) : null}
							</div>
						) : null}
					</div>
					{processing ? (
						<div className='card-body'>
							<div className='text-center'>
								<i className='fas fa-circle-notch fa-spin fa-2x'></i>
							</div>
						</div>
					) : (
						<div className='card-body'>
							{data.length > 0 ? (
								<div className='table-responsive' style={{ overflowY: 'hidden' }}>
									<Datatable
										columns={columns}
										data={data.map((item, index) => ({
											...item,
											action: (
												<div className={`d-flex w-100 ${!withAction ? 'd-none' : ''}`}>
													{outIf(
														dontShowView === undefined || dontShowView === false,
														<button className='mx-1 btn btn-link' onClick={() => onViewClick(item)}>
															<i className='ni ni-active-40 text-info'></i>
															View
														</button>
													)}
													{outIf(
														dontShowEdit === undefined || dontShowEdit === false,
														<button className='mx-1 btn btn-link' onClick={() => onEditClick(item)}>
															<i className='ni ni-ruler-pencil text-warning'></i>
															Edit
														</button>
													)}
													{outIf(
														dontShowDelete === undefined || dontShowDelete === false,
														<button
															type='button'
															data-toggle='modal'
															data-target={`#deleteModal${index}`}
															className='mx-1 btn btn-link'>
															<i className='ni ni-fat-delete text-danger'></i>
															Delete
														</button>
													)}
												</div>
											),
										}))}
										pagination
										theme={'default'}
									/>
								</div>
							) : null}
							{data.length === 0 ? (
								<div className='card-body'>
									<h3 className='text-center'>No Data</h3>
								</div>
							) : null}
						</div>
					)}
					{withAction
						? data.map((item, index) => (
								<div
									key={index}
									className='modal fade'
									id={`deleteModal${index}`}
									tabIndex={-1}
									role='dialog'
									aria-labelledby={`deleteModalLabel${index}`}
									aria-hidden='true'>
									<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
										<div className='modal-content'>
											<div className='modal-header'>
												<h5 className='modal-title' id={`deleteModalLabel${index}`}>
													Delete {pluralize.singular(title)}
												</h5>
												<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
													<span aria-hidden='true'>&times;</span>
												</button>
											</div>
											<div className='modal-body'>
												Are you sure you want to delete this {pluralize.singular(title)}?
											</div>
											<div className='modal-footer'>
												<button
													type='button'
													className='btn btn-danger btn-sm'
													onClick={(e) => {
														e.preventDefault();
														const modal = $(`#deleteModal${index}`);
														modal.on('hidden.bs.modal', () => onDeleteConfirm(item));
														modal.modal('hide');
													}}>
													Confirm
												</button>
												<button type='button' className='btn btn-secondary btn-sm' data-dismiss='modal'>
													Cancel
												</button>
											</div>
										</div>
									</div>
								</div>
						  ))
						: null}
				</div>
			</div>
		</div>
	);
}
