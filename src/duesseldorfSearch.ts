import type { ResultItem, SearchImpl, VcsUiApp } from '@vcmap/ui';
import {
  AddressBalloonFeatureInfoView,
  featureInfoViewSymbol,
} from '@vcmap/ui';
import { Feature } from 'ol';
import type { AddressBalloonFeatureInfoViewOptions } from '@vcmap/ui/src/featureInfo/addressBalloonFeatureInfoView';
import { WKT } from 'ol/format';
import { Projection } from '@vcmap/core';
import { name } from '../package.json';

type Candidate = {
  geom?: string;
  text: string;
  cat: string;
  searchId: string;
  score: string;
  art?: string;
  stadtteil?: string;
  adresse?: string;
  plz?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '2'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  wfs_url?: string;
};

export type PluginConfig = {
  url?: string;
  epsg?: string;
  proj4?: string;
  params?: string;
  resultsTitle?: Array<keyof Candidate>;
  balloon?: {
    balloonTitle?: keyof Candidate;
    balloonSubtitle?: Array<keyof Candidate>;
    addressName?: keyof Candidate;
    street?: keyof Candidate;
    number?: keyof Candidate;
    city?: keyof Candidate;
    zip?: keyof Candidate;
    country?: keyof Candidate;
  };
};

class DuesseldorfSearch implements SearchImpl {
  app: VcsUiApp;

  url: string;

  epsg: string;

  proj4: string;

  params: string;

  resultsTitle: Array<keyof Candidate>;

  balloonTitle: keyof Candidate;

  balloonSubtitle: Array<keyof Candidate>;

  addressName: keyof Candidate | undefined;

  street: keyof Candidate | undefined;

  number: keyof Candidate | undefined;

  city: keyof Candidate | undefined;

  zip: keyof Candidate | undefined;

  country: keyof Candidate | undefined;

  private _abortController: AbortController | undefined;

  constructor(app: VcsUiApp, config: Required<PluginConfig>) {
    this.app = app;
    this.url = config.url.replace(/\/$/, '');
    this.epsg = config.epsg!;
    this.proj4 = config.proj4!;
    this.params = config.params!;
    this.balloonTitle = config.balloon.balloonTitle!;
    this.balloonSubtitle = config.balloon.balloonSubtitle!;
    this.addressName = config.balloon.addressName;
    this.street = config.balloon.street;
    this.number = config.balloon.number;
    this.city = config.balloon.city;
    this.zip = config.balloon.zip;
    this.country = config.balloon.country;
    this.resultsTitle = config.resultsTitle;
  }

  // eslint-disable-next-line class-methods-use-this
  get name(): string {
    return name;
  }

  async search(query: string): Promise<ResultItem[]> {
    const { locale } = this.app;
    const params = {
      p: `${locale === 'en' || locale === 'de' ? locale : 'de'},${this.params},${query}`,
    };

    const url = new URL(this.url);
    url.search = new URLSearchParams(params).toString();
    this.abort();
    this._abortController = new AbortController();

    const response = await fetch(url, { signal: this._abortController.signal });
    const results = (await response.json()) as { data: Candidate[] };

    const enrichedCandidates = await Promise.all(
      results.data
        .filter(
          (candidate) =>
            typeof candidate.geom === 'string' && candidate.geom.trim() !== '',
        )
        .map(async (candidate) => {
          if (candidate.wfs_url && candidate.wfs_url.trim() !== '') {
            try {
              const wfsResponse = await fetch(candidate.wfs_url);
              const wfsData = await wfsResponse.json();

              const feature = wfsData?.features?.[0];
              if (
                feature &&
                feature.properties &&
                typeof feature.properties === 'object'
              ) {
                Object.assign(candidate, feature.properties);
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn(
                `Failed to fetch wfs_url for candidate`,
                candidate,
                error,
              );
            }
          }

          return candidate;
        }),
    );
    return enrichedCandidates.map(this.createResultItem.bind(this));
  }

  async suggest(query: string): Promise<string[]> {
    if (query.length < 4) {
      return [];
    }
    const { locale } = this.app;
    const params = {
      p: `${locale === 'en' || locale === 'de' ? locale : 'de'},${this.params},${query}`,
    };
    const url = new URL(this.url);
    url.search = new URLSearchParams(params).toString();
    this.abort();
    this._abortController = new AbortController();
    const response = await fetch(url, { signal: this._abortController.signal });
    const results = (await response.json()) as { data: Candidate[] };

    return results.data
      .filter(
        (suggestion) =>
          typeof suggestion.geom === 'string' && suggestion.geom.trim() !== '',
      )
      .map((suggestion) => suggestion.text);
  }

  createResultItem(candidate: Candidate): ResultItem {
    const feature = new Feature();

    const targetProj = 'EPSG:3857'; //

    const epsg25832 = new Projection({
      epsg: this.epsg,
      proj4: this.proj4,
    });

    const wktFormat = new WKT();
    const geometry = wktFormat.readGeometry(candidate.geom, {
      dataProjection: epsg25832.proj,
      featureProjection: targetProj,
    });

    feature.setGeometry(geometry);

    feature.setProperties(candidate);

    // @ts-expect-error: symbol not properly declared in ui
    feature[featureInfoViewSymbol] = new AddressBalloonFeatureInfoView({
      type: 'AddressBalloonFeatureInfoView',
      name: 'DuesseldorfSearchBalloon',
      balloonTitle: candidate[this.balloonTitle] ?? candidate.text,
      balloonSubtitle:
        (Array.isArray(this.balloonSubtitle)
          ? this.balloonSubtitle
              .map((key) => candidate[key])
              .filter((value) => value != null && value !== '')
              .join(' - ')
          : (candidate[this.balloonSubtitle] ?? candidate.cat)) ||
        candidate.cat,
      ...(this.addressName && candidate[this.addressName]
        ? { addressName: this.addressName }
        : {}),
      ...(this.street && candidate[this.street] ? { street: this.street } : {}),
      ...(this.number && candidate[this.number] ? { number: this.number } : {}),
      ...(this.city && candidate[this.city] ? { city: this.city } : {}),
      ...(this.zip && candidate[this.zip] ? { zip: this.zip } : {}),
      ...(this.country && candidate[this.country]
        ? { country: this.country }
        : {}),
    } satisfies AddressBalloonFeatureInfoViewOptions);
    const titleParts = this.resultsTitle
      .map((key) => candidate[key])
      .filter((value) => value != null && value !== '')
      .join(' - ');

    return {
      title: titleParts,
      feature,
    };
    // return {
    //   title: `${candidate.text} - ${candidate.cat}`,
    //   feature,
    // };
  }

  abort(): void {
    this._abortController?.abort();
    this._abortController = undefined;
  }

  destroy(): void {
    this.abort();
  }
}

export default DuesseldorfSearch;
