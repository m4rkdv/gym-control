// Barrel exports for domain package
// Entities
export * from './entities/User.js';
export * from './entities/Member.js';
export * from './entities/Trainer.js';
export * from './entities/MembershipStatusChange.js';
export * from './entities/Promotion.js';
export * from './entities/SystemConfig.js';
export * from './entities/Payment.js';

// Repositories (interfaces)
export * from './repositories/user-repository.js';
export * from './repositories/member-repository.js';
export * from './repositories/payment-repository.js';
export * from './repositories/system-config-repository.js';
export * from './repositories/promotion-repository.js';
export * from './repositories/trainer-repository.js';

// Errors
export * from './errors/error.js';

// Services
export * from './services/auth/auth-user.js';
export * from './services/business-rules/verify-membership-status.js';

// Use cases - Members
export * from './use-cases/members/register-member.js';
export * from './use-cases/members/create-credentials-for-member.js';
export * from './use-cases/members/change-member-status.js';

// Use cases - Trainers
export * from './use-cases/trainers/register-trainer.js';
export * from './use-cases/trainers/create-credentials-for-trainer.js';

// Use cases - Payments
export * from './use-cases/payments/process-payment.js';
export * from './use-cases/payments/update-membership.js';
export * from './use-cases/payments/validate-payment.js';

// Utils
export * from './utils/date.js';
export * from './utils/trainer-username.js';
