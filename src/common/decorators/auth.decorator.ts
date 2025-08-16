import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { REQUIRE_ADMIN } from './require-admin.decorator';

export function AuthDecorator(options?: { isAdmin?: boolean }) {
  const isAdmin = options?.isAdmin ?? false;
  return applyDecorators(
    UseGuards(AuthGuard),
    ApiBearerAuth('Authorization'),
    SetMetadata(REQUIRE_ADMIN, isAdmin),
  );
}