import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(PrismaClientExceptionFilter.name);

	catch(exception: Prisma.PrismaClientKnownRequestError, _host: ArgumentsHost): void {
		this.logger.error(`${exception.code}:`, exception.meta?.cause ?? exception.message);

		switch (exception.code) {
			case 'P2002': {
				throw new GraphQLError('An entry with this value already exists.', {
					extensions: { code: 'CONFLICT', status: HttpStatus.CONFLICT }
				});
			}
			case 'P2003': {
				throw new GraphQLError('Connection error: one of the specified IDs was not found', {
					extensions: { code: 'BAD_REQUEST', status: HttpStatus.BAD_REQUEST }
				});
			}
			case 'P2025': {
				const message =
					typeof exception.meta?.cause === 'string'
						? exception.meta.cause
						: 'Record not found in database';

				throw new GraphQLError(message, {
					extensions: { code: 'NOT_FOUND', status: HttpStatus.NOT_FOUND }
				});
			}
			default:
				throw new GraphQLError('Database error', {
					extensions: { code: 'INTERNAL_SERVER_ERROR' }
				});
		}
	}
}
