'use client';

import { useIdleTimer } from 'react-idle-timer';

export function useDevServerHeartbeat() {
  // DÉSACTIVÉ: Ce heartbeat peut causer des boucles de rechargement
  // Seulement utile pour les serveurs proxy cloud, pas en local
  return null;

  // useIdleTimer({
  //   throttle: 60_000 * 3,
  //   timeout: 60_000,
  //   onAction: () => {
  //     fetch('/', {
  //       method: 'GET',
  //     }).catch((error) => {
  //       // this is a no-op, we just want to keep the dev server alive
  //     });
  //   },
  // });
}
