import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMetaDto } from '~/common/dto/page';

export class PageDto<T> {
	constructor(data: T[], meta: PageMetaDto) {
		this.data = data;
		this.meta = meta;
	}

	@IsArray()
	@ApiProperty({ isArray: true })
	readonly data: T[];

	@ApiProperty({ type: () => PageMetaDto })
	readonly meta: PageMetaDto;
}
