export interface IMailerOpts {
  subject: string;
  text: string;
  html: string;
  to: string;
  from?: string;
}
