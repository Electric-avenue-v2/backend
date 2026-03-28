export interface OpenSearchBody<T = unknown> {
	hits: {
		total: {
			value: number;
			relation: string;
		};
		hits: {
			_id: string;
			_source?: T;
		}[];
	};
}

export type QueryDsl = Record<string, unknown>;
