# search-duesseldorf

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

This plugin provides search functionality for the Düsseldorf area, integrating with the VC Map Project. It allows users to search for locations, addresses, and points of interest within Düsseldorf.

## Configuration

The first part of the configuration handles the search relevant information. This includes the EPSG code, Proj4 string, URL for the search service, and any additional parameters required for the search.

```json
  "epsg": "EPSG:25832",
  "proj4": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  "url": "https://maps.duesseldorf.de/viewer/php/search/search.php?p=",
  "params": "acdipst,25"
```

The second part defines the result visualization. The resultsTitle specifies what the search results are combined of.
The balloon object defines the content of the balloon that is displayed when a search result is clicked. It includes the title, subtitle, and address details such as city, zip code, street, number, and country.

```json
  "resultsTitle": ["text", "cat"],
  "balloon": {
    "balloonTitle": "text",
    "balloonSubtitle": ["cat", "art"],
    "city": "stadtteil",
    "zip": "plz",
    "addressName": "adresse",
    "street": "",
    "number": "",
    "country": ""
  }
```
