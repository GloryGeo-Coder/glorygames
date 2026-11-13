import { blockAt } from './settlement.mjs';

// Presentation only: inspecting a citizen must never advance a trip or create a sale.
export function journeySummary(city, profile, trip, runtime = {}) {
  if (!trip) return 'No trip assigned.';
  const family = profile.family && profile.visit === 'park';
  const role = family ? 'Family park visit' : 'Adult resident';
  const companion = family ? ` · ${profile.childName}, child accompanied by ${profile.name}` : '';
  const destination = city?.pieces?.find(p => p.id === (trip.returning ? trip.home : trip.shop));
  const target = trip.returning ? 'home' : (profile.destination || 'destination').toLowerCase();
  const where = destination ? ` in ${blockAt(destination.x, destination.z).code}` : '';
  const state = trip.paused ? 'Paused. Resume this household in Residents.'
    : runtime.issue ? `Stopped: ${runtime.issue}`
    : trip.phase === 'done' ? 'At home. Journey complete.'
    : runtime.waitingForCrossing ? 'Looking before using the marked crossing.'
    : trip.phase === 'queue' ? 'Waiting beside the entrance. Keep the doorway and queue clear.'
    : runtime.waitingForSeat ? 'Waiting for the park bench to become free.'
    : trip.phase === 'shopping' ? (profile.activity || 'Visiting') + '.'
    : `Travelling to ${target}${where}.`;
  return `${profile.name} · ${role}${companion}. ${state}`;
}
