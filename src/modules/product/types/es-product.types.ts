export interface EsAttribute {
	slug: string;
	name: string;
	value: string;
	numericValue: number | null;
}

export interface EsProductVariant {
	id: string;
	sku: string;
	price: number;
	stock: number;
	attributes: EsAttribute[];
	imageUrl: string | null;
}

export interface EsProductDocument {
	id: string;
	title: string;
	slug: string;
	description: string;

	categoryId: string;
	categoryName: string;
	categorySlug: string;

	sellerId: string;

	minPrice: number;
	maxPrice: number;
	totalStock: number;
	inStock: boolean;

	thumbnailUrl: string | null;

	specs: EsAttribute[];
	variants: EsProductVariant[];

	createdAt: Date;
	updatedAt: Date;
}
