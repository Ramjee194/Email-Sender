import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // You can add authentication checks here if needed
  return await resolve(event);
};