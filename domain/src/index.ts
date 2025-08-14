// Barrel exports for domain package
// Entities
export * from './entities/User';
export * from './entities/Member';
export * from './entities/Trainer';
export * from './entities/MembershipStatusChange';
export * from './entities/Promotion';
export * from './entities/SystemConfig';
export * from './entities/Payment';

// Repositories (interfaces)
export * from './repositories/user-repository';
export * from './repositories/member-repository';
export * from './repositories/payment-repository';
export * from './repositories/system-config-repository';
export * from './repositories/promotion-repository';
export * from './repositories/trainer-repository';

// Errors
export * from './errors/error';

// Services
export * from './services/auth/auth-user';
export * from './services/business-rules/verify-membership-status';

// Use cases - Members
export * from './use-cases/members/register-member';
export * from './use-cases/members/create-credentials-for-member';
export * from './use-cases/members/change-member-status';

// Use cases - Trainers
export * from './use-cases/trainers/register-trainer';
export * from './use-cases/trainers/create-credentials-for-trainer';

// Use cases - Payments
export * from './use-cases/payments/process-payment';
export * from './use-cases/payments/update-membership';
export * from './use-cases/payments/validate-payment';

// Utils
export * from './utils/date';
export * from './utils/trainer-username';
