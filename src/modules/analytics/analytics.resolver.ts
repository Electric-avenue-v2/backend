import { Resolver } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}
}
