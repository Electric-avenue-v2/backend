import { isObject } from '~/common/utils/utils';
import { EsAggregations } from '../types/search-mapper.types';

export function isEsAggregations(val: unknown): val is EsAggregations {
	return isObject(val) && 'specs_agg' in val && 'variant_attrs_agg' in val;
}
