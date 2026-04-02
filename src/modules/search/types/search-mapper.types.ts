export interface EsAttributeBucket {
	key: string;
	doc_count: number;
}

interface EsNestedAggregation {
	slugs: {
		buckets: {
			key: string;
			doc_count: number;
			names: { buckets: { key: string }[] };
			values: { buckets: EsAttributeBucket[] };
		}[];
	};
}

export interface EsPerFacetAggregation {
	specs: {
		by_slug: {
			values: { buckets: EsAttributeBucket[] };
		};
	};
	variant_attrs: {
		attrs: {
			by_slug: {
				values: { buckets: EsAttributeBucket[] };
			};
		};
	};
}

export interface EsAggregations {
	specs_agg: EsNestedAggregation;
	variant_attrs_agg: { doc_count: number; attrs: EsNestedAggregation };
	price_min: { value: number | null };
	price_max: { value: number | null };
}
