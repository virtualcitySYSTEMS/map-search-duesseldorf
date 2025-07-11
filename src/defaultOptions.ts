import type { PluginConfig } from './duesseldorfSearch.js';

export default function getDefaultOptions(): PluginConfig {
  return {
    epsg: 'EPSG:25832',
    proj4:
      '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    url: 'https://maps.duesseldorf.de/viewer/php/search/search.php?p=',
    params: 'acdipst,25',
    resultsTitle: ['text', '2'],
    balloon: {
      balloonTitle: 'text',
      balloonSubtitle: ['2'],
      city: 'stadtteil',
      zip: 'plz',
      addressName: 'adresse',
      street: undefined,
      number: undefined,
      country: undefined,
    },
  };
}
