import type { Order } from './db.ts';

export const ACTIVE_STATUSES: Order['status'][] = ['accepted', 'preparing', 'out_for_delivery', 'ready'];
export const DONE_STATUSES: Order['status'][] = ['delivered', 'rejected', 'cancelled'];
