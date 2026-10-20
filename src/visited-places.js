import { internationalPlaces } from './international-places.js';
import { vietnamPlaces } from './vietnam-places.js';
// Places supplied by the author. Do not infer dates, photos or other cities.
export const visitedPlaces = {
  ID: internationalPlaces.filter(place => place.code === 'ID').map(place => place.name),
  MY: internationalPlaces.filter(place => place.code === 'MY').map(place => place.name),
  KH: internationalPlaces.filter(place => place.code === 'KH').map(place => place.name),
  SG: internationalPlaces.filter(place => place.code === 'SG').map(place => place.name),
  TH: internationalPlaces.filter(place => place.code === 'TH').map(place => place.name),
  JP: internationalPlaces.filter(place => place.code === 'JP').map(place => place.name),
  CN: internationalPlaces.filter(place => place.code === 'CN').map(place => place.name),
  VN: vietnamPlaces.map(place => place.name),
};
export const visitedPlacesVersion = 'author-visited-countries-2026-10-20-with-vietnam';
