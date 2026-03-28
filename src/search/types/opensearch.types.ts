import type { ApiResponse } from '@opensearch-project/opensearch';

export interface ProductSearchBody {
	hits: {
		total: { value: number };
		hits: { _id: string }[];
	};
}

export type TypedApiResponse<T> = Omit<ApiResponse, 'body'> & {
	body: T;
};
