// Main API service exports

export { clientService } from './client';
export { creditService } from './credit';
export { paymentService } from './payment';
export { scheduleService } from './schedule';

export type {
    Client,
    ClientSearchResponse,
    PaymentSchedule,
    PaymentStatus,
    PaymentSummary
} from './client';

export type {
    Payment, PaymentFilters, PaymentSummary as PaymentSummaryType
} from './payment';

export type {
    RepartidorCronograma, ScheduleFilters, PaymentSchedule as SchedulePaymentSchedule,
    ScheduleSummary
} from './schedule';

export type {
    Credit, CreditFilters, CreditSummary
} from './credit';

