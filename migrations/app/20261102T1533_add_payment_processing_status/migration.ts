#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract';
import startContract from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/323d24ab1fff7a9ae8374ffa5c2703ee8a52b6b32bce425be1828dd06774f1f8/contract';
import endContract from '../../snapshots/323d24ab1fff7a9ae8374ffa5c2703ee8a52b6b32bce425be1828dd06774f1f8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'payment',
        constraint: 'payment_status_check_f11e0b8c',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'payment',
        constraint: 'payment_status_check_f11e0b8c',
        expression: `"status" IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
