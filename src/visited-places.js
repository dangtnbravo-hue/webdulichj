import { vietnamPlaces } from './vietnam-places.js';
// Places supplied by the author. Do not infer dates, photos or other cities.
export const visitedPlaces = {
  ID: ['Jakarta'],
  MY: ['Kuala Lumpur'],
  KH: ['Phnom Penh', 'Siem Reap'],
  SG: ['Singapore'],
  TH: [],
  JP: ['Tokyo', 'Fuji'],
  CN: ['Lệ Giang'],
  VN: vietnamPlaces.map(place => place.name),
};
export const visitedPlacesVersion = 'author-visited-countries-2026-10-20-with-vietnam';
