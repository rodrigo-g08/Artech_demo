import {D1Store,handleTickets} from '../../_lib/artech-tickets.mjs';
export function onRequest(context){return handleTickets(context.request,context.env,context.env.ARTECH_TICKETS_DB?new D1Store(context.env.ARTECH_TICKETS_DB):null,context.env.ASSETS);}
