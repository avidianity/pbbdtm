declare global {
	interface String {
		parseNumbers(): number;
	}

	interface Error {
		toJSON(): Object;
	}

	type ModalModes = 'toggle' | 'show' | 'hide' | 'handleUpdate' | 'dispose';

	interface JQuery {
		modal(mode: ModalModes);
	}

	type RequestStatus = 'Received' | 'Processing' | 'Payment' | 'Evaluating' | 'Evaluated' | 'Signed' | 'Releasing' | 'Released';

	type Roles = 'Admin' | 'Processing' | 'Cashier' | 'Evaluation' | 'Registrar' | 'Director' | 'Releasing' | 'Applicant';

	type ValueOf<T> = T[keyof T];

	type FAQ = { question: string; answer: string; new?: boolean };
}

export {};
