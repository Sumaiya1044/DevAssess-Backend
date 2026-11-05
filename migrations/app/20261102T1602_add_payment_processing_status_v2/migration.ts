#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/323d24ab1fff7a9ae8374ffa5c2703ee8a52b6b32bce425be1828dd06774f1f8/contract';
import endContract from '../../snapshots/323d24ab1fff7a9ae8374ffa5c2703ee8a52b6b32bce425be1828dd06774f1f8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a3891f8e7c7dc6da32368f37fe345c710029994c2063ed8922e7bcc81c5a2958/contract';
import startContract from '../../snapshots/a3891f8e7c7dc6da32368f37fe345c710029994c2063ed8922e7bcc81c5a2958/contract.json' with { type: 'json' };
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
