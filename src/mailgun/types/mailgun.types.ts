export interface SendTemplateEmailDto {
  to: string | string[];
  subject?: string;
  template: string;
  variables?: Record<string, string | number>;
  from?: string;
}