import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from '~/common/types/page.types';

export class PageMetaDto {
	constructor({ pageOptionsDto, itemsCount }: PageMetaDtoParameters) {
		this.page = pageOptionsDto.page ?? 1;
		this.take = pageOptionsDto.take ?? 10;
		this.itemsCount = itemsCount;
		this.pageCount = Math.ceil(this.itemsCount / this.take);
	}

	@ApiProperty()
	readonly page: number;

	@ApiProperty()
	readonly take: number;

	@ApiProperty()
	readonly itemsCount: number;

	@ApiProperty()
	readonly pageCount: number;
}
