import React from 'react';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

// Simple modular router configuration helper
export const appRoutes = {
  overview: '/overview',
  browse: '/browse',
  postTicket: '/post-ticket',
  messages: '/messages',
  wallet: '/wallet',
  admin: '/admin',
  profile: '/profile',
  login: '/login'
};
