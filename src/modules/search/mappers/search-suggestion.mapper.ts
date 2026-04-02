import { Injectable } from '@nestjs/common';
import type { EsProductDocument } from '~/modules/product/types/es-product.types';
import type { SearchSuggestion } from '../models/search-suggestion.model';

export const suggestionFields = ['title', 'slug', 'categorySlug', 'categoryName'] as const;
export type SuggestionSource = Pick<EsProductDocument, (typeof suggestionFields)[number]>;

@Injectable()
export class SearchSuggestionMapper {
	toSuggestion(source: SuggestionSource): SearchSuggestion {
		return {
			title: source.title,
			slug: source.slug,
			categorySlug: source.categorySlug,
			categoryName: source.categoryName
		};
	}
}
