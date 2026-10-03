#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract';
import startContract from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a3891f8e7c7dc6da32368f37fe345c710029994c2063ed8922e7bcc81c5a2958/contract';
import endContract from '../../snapshots/a3891f8e7c7dc6da32368f37fe345c710029994c2063ed8922e7bcc81c5a2958/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'attempt',
        constraint: 'attempt_assessmentId_candidateId_key',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
