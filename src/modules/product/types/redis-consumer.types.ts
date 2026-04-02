export type DebeziumRecord = Record<string, unknown>;

export interface DebeziumPayload {
	op: 'c' | 'u' | 'd' | 'r';
	before?: DebeziumRecord;
	after?: DebeziumRecord;
}

export type StreamEntry = [id: string, fields: string[]];
export type StreamResult = [streamKey: string, messages: StreamEntry[]];
