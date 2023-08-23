import { SetMetadata } from '@nestjs/common';

export const PublicRoute = () => SetMetadata('publicRoute', true);
