export interface SendEmailDto {
  to: string;
  subject: string;
  html?: string;
  // optional plaintext body used in some tests
  text?: string;
}
