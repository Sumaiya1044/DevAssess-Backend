#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract';
import endContract from '../../snapshots/1df3c87349b39fd6679ae7b6dc93bf5d853aba5fbe5df16356bc85726d1205fe/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'assessment',
        columns: [
          col('companyId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('createdById', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('durationMinutes', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('price', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('publishedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'assessment_status_check_aaf19bbb',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'assessmentProblem',
        columns: [
          col('assessmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('problemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'attempt',
        columns: [
          col('assessmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('candidateId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('NOT_STARTED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('submittedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'attempt_status_check_2037e2e4',
            "\"status\" IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'auditLog',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('entity', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('entityId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ipAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'company',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('industry', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('logo', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('website', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'invitation',
        columns: [
          col('assessmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('candidateId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'invitation_status_check_0fbd50ff',
            "\"status\" IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'payment',
        columns: [
          col('amount', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('assessmentId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('BDT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('gatewaySessionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('method', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paidAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transactionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'payment_method_check_c00d42fe',
            "\"method\" IN ('STRIPE', 'BKASH', 'SSLCOMMERZ')",
          ),
          checkExpression(
            'payment_status_check_f11e0b8c',
            "\"status\" IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'problem',
        columns: [
          col('correctAnswer', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('options', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('points', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('solution', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('testCases', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'problem_type_check_97fb4b4e',
            "\"type\" IN ('MCQ', 'CODING', 'WRITTEN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'result',
        columns: [
          col('attemptId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('maxScore', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('passed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('percentage', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('totalScore', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'submission',
        columns: [
          col('answer', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('attemptId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('candidateId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('code', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('evaluatedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('feedback', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('language', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('problemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('score', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('submittedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'submission_status_check_b7a2787b',
            "\"status\" IN ('PENDING', 'EVALUATED', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('googleId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('CANDIDATE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'user_role_check_eaf0c157',
            "\"role\" IN ('ADMIN', 'COMPANY', 'CANDIDATE')",
          ),
          checkExpression(
            'user_status_check_15e9af0c',
            "\"status\" IN ('ACTIVE', 'BLOCKED', 'DELETED')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'assessmentProblem',
        constraint: 'assessmentProblem_assessmentId_problemId_key',
        columns: ['assessmentId', 'problemId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'assessmentProblem',
        constraint: 'assessmentProblem_assessmentId_order_key',
        columns: ['assessmentId', 'order'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'attempt',
        constraint: 'attempt_assessmentId_candidateId_key',
        columns: ['assessmentId', 'candidateId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'company',
        constraint: 'company_ownerId_key',
        columns: ['ownerId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'invitation',
        constraint: 'invitation_assessmentId_candidateId_key',
        columns: ['assessmentId', 'candidateId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'payment',
        constraint: 'payment_transactionId_key',
        columns: ['transactionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'payment',
        constraint: 'payment_gatewaySessionId_key',
        columns: ['gatewaySessionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'result',
        constraint: 'result_attemptId_key',
        columns: ['attemptId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'submission',
        constraint: 'submission_attemptId_problemId_key',
        columns: ['attemptId', 'problemId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_googleId_key',
        columns: ['googleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessment',
        index: 'assessment_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessment',
        index: 'assessment_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessment',
        index: 'assessment_createdById_idx_8bf640ed',
        columns: ['createdById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessment',
        index: 'assessment_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessmentProblem',
        index: 'assessmentProblem_assessmentId_idx_1fe05216',
        columns: ['assessmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'assessmentProblem',
        index: 'assessmentProblem_problemId_idx_0024556d',
        columns: ['problemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attempt',
        index: 'attempt_assessmentId_idx_1fe05216',
        columns: ['assessmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attempt',
        index: 'attempt_candidateId_idx_462b5869',
        columns: ['candidateId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attempt',
        index: 'attempt_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attempt',
        index: 'attempt_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_action_idx_cd0d2116',
        columns: ['action'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_entity_entityId_idx_efadd7fc',
        columns: ['entity', 'entityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'company',
        index: 'company_name_idx_ce87e6ba',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_assessmentId_idx_1fe05216',
        columns: ['assessmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_candidateId_idx_462b5869',
        columns: ['candidateId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invitation',
        index: 'invitation_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payment',
        index: 'payment_assessmentId_idx_1fe05216',
        columns: ['assessmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payment',
        index: 'payment_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payment',
        index: 'payment_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payment',
        index: 'payment_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'problem',
        index: 'problem_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'problem',
        index: 'problem_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'result',
        index: 'result_passed_idx_23b312ac',
        columns: ['passed'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'result',
        index: 'result_percentage_idx_4cc2fd0e',
        columns: ['percentage'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'submission',
        index: 'submission_attemptId_idx_94f50eb9',
        columns: ['attemptId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'submission',
        index: 'submission_candidateId_idx_462b5869',
        columns: ['candidateId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'submission',
        index: 'submission_problemId_idx_0024556d',
        columns: ['problemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'submission',
        index: 'submission_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user',
        index: 'user_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user',
        index: 'user_role_idx_2c1ddf83',
        columns: ['role'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user',
        index: 'user_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'assessment',
        foreignKey: {
          name: 'assessment_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'assessment',
        foreignKey: {
          name: 'assessment_createdById_fkey',
          columns: ['createdById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'assessmentProblem',
        foreignKey: {
          name: 'assessmentProblem_assessmentId_fkey',
          columns: ['assessmentId'],
          references: { schema: 'public', table: 'assessment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'assessmentProblem',
        foreignKey: {
          name: 'assessmentProblem_problemId_fkey',
          columns: ['problemId'],
          references: { schema: 'public', table: 'problem', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attempt',
        foreignKey: {
          name: 'attempt_assessmentId_fkey',
          columns: ['assessmentId'],
          references: { schema: 'public', table: 'assessment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attempt',
        foreignKey: {
          name: 'attempt_candidateId_fkey',
          columns: ['candidateId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'company',
        foreignKey: {
          name: 'company_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invitation',
        foreignKey: {
          name: 'invitation_assessmentId_fkey',
          columns: ['assessmentId'],
          references: { schema: 'public', table: 'assessment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invitation',
        foreignKey: {
          name: 'invitation_candidateId_fkey',
          columns: ['candidateId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'payment',
        foreignKey: {
          name: 'payment_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'payment',
        foreignKey: {
          name: 'payment_assessmentId_fkey',
          columns: ['assessmentId'],
          references: { schema: 'public', table: 'assessment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'result',
        foreignKey: {
          name: 'result_attemptId_fkey',
          columns: ['attemptId'],
          references: { schema: 'public', table: 'attempt', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'submission',
        foreignKey: {
          name: 'submission_attemptId_fkey',
          columns: ['attemptId'],
          references: { schema: 'public', table: 'attempt', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'submission',
        foreignKey: {
          name: 'submission_problemId_fkey',
          columns: ['problemId'],
          references: { schema: 'public', table: 'problem', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'submission',
        foreignKey: {
          name: 'submission_candidateId_fkey',
          columns: ['candidateId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
