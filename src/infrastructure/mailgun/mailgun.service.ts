import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import { SendTemplateEmailDto } from './types/mailgun.types';

@Injectable()
export class MailgunService {
	private readonly logger = new Logger(MailgunService.name);
	private readonly client: ReturnType<Mailgun['client']>;

	constructor(private readonly configService: ConfigService) {
		const mailgun = new Mailgun(FormData);

		this.client = mailgun.client({
			username: 'api',
			key: this.configService.getOrThrow('MAILGUN_API_KEY'),
			url: 'https://api.eu.mailgun.net'
		});
	}

	async sendTemplateEmail({
		to,
		subject,
		template,
		variables = {},
		from
	}: SendTemplateEmailDto): Promise<void> {
		const domain = this.configService.getOrThrow<string>('MAILGUN_DOMAIN');
		const defaultFrom = this.configService.getOrThrow<string>('MAILGUN_FROM');

		try {
			await this.client.messages.create(domain, {
				from: from ?? defaultFrom,
				to,
				subject,
				template,
				'h:X-Mailgun-Variables': JSON.stringify(variables)
			});

			const toLog = Array.isArray(to) ? to.join(', ') : to;
			this.logger.log(`Template "${template}" is sent to "${toLog}"`);
		} catch (error) {
			this.logger.error('Mailgun send error', error);
			throw error;
		}
	}
}
