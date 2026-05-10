import { Inject } from '@nestjs/common';

export const DRIZZLE = 'DRIZZLE';

export const InjectDrizzle = () => Inject(DRIZZLE);
