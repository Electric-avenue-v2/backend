import { isObject } from '~/common/utils/utils';
import { EsAggregations, EsPerFacetAggregation } from '../types/search-mapper.types';

export function isEsAggregations(val: unknown): val is EsAggregations {
	return isObject(val) && 'specs_agg' in val && 'variant_attrs_agg' in val;
}

export function isEsPerFacetAggregation(val: unknown): val is EsPerFacetAggregation {
	return isObject(val) && 'specs' in val && 'variant_attrs' in val;
}
