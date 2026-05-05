import { DebeziumPayload, DebeziumRecord, StreamResult } from '../types/redis-consumer.types';
import { isObject } from '~/common/utils';

export function isDebeziumPayload(val: unknown): val is DebeziumPayload {
	if (!isObject(val)) return false;
	const op = val.op;
	return op === 'c' || op === 'u' || op === 'd' || op === 'r';
}

export function isStreamResults(val: unknown): val is StreamResult[] {
	return Array.isArray(val);
}

export function getString(record: DebeziumRecord, key: string): string | null {
	const val = record[key];
	return typeof val === 'string' ? val : null;
}
