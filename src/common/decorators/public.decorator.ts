import type { CustomDecorator} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const Public = (): CustomDecorator => SetMetadata('isPublic', true);
