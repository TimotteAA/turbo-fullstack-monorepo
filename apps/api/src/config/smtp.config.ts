import { createSmtpConfig } from '@/modules/missions/helpers';
import { SmtpClientConfig } from '@/modules/missions/types';

export const smtp = createSmtpConfig(() => ({}) as SmtpClientConfig);
