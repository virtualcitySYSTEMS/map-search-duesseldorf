import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import getDefaultOptions from './defaultOptions.js';
import DuesseldorfSearch from './duesseldorfSearch';
import type { PluginConfig } from './duesseldorfSearch';

type PluginState = Record<never, never>;

type DuesseldorfSearchPlugin = VcsPlugin<PluginConfig, PluginState>;

export default function plugin(config: PluginConfig): DuesseldorfSearchPlugin {
  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    initialize(vcsUiApp: VcsUiApp): void {
      function mergeConfig(
        defaultConfig: Required<PluginConfig>,
        userConfig: PluginConfig,
      ): Required<PluginConfig> {
        return {
          ...defaultConfig,
          ...userConfig,
          balloon: {
            ...defaultConfig.balloon,
            ...userConfig.balloon,
          },
        };
      }
      vcsUiApp.search.add(
        new DuesseldorfSearch(
          vcsUiApp,
          mergeConfig(getDefaultOptions() as Required<PluginConfig>, config),
        ),
        name,
      );
    },

    /**
     * should return all default values of the configuration
     */
    getDefaultOptions,
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): PluginConfig {
      const serial: PluginConfig = {};

      if (config.url !== undefined && config.url !== getDefaultOptions().url) {
        serial.url = config.url;
      }
      if (
        config.epsg !== undefined &&
        config.epsg !== getDefaultOptions().epsg
      ) {
        serial.epsg = config.epsg;
      }
      if (
        config.proj4 !== undefined &&
        config.proj4 !== getDefaultOptions().proj4
      ) {
        serial.proj4 = config.proj4;
      }
      if (
        config.params !== undefined &&
        config.params !== getDefaultOptions().params
      ) {
        serial.params = config.params;
      }
      if (
        config.resultsTitle !== undefined &&
        JSON.stringify(config.resultsTitle) !==
          JSON.stringify(getDefaultOptions().resultsTitle)
      ) {
        serial.resultsTitle = config.resultsTitle;
      }

      const balloonDiff: PluginConfig['balloon'] = {};

      if (
        config.balloon?.balloonTitle !== undefined &&
        config.balloon.balloonTitle !==
          getDefaultOptions().balloon?.balloonTitle
      ) {
        balloonDiff.balloonTitle = config.balloon.balloonTitle;
      }

      if (
        config.balloon?.balloonSubtitle !== undefined &&
        JSON.stringify(config.balloon.balloonSubtitle) !==
          JSON.stringify(getDefaultOptions().balloon?.balloonSubtitle)
      ) {
        balloonDiff.balloonSubtitle = config.balloon.balloonSubtitle;
      }

      if (
        config.balloon?.city !== undefined &&
        config.balloon.city !== getDefaultOptions().balloon?.city
      ) {
        balloonDiff.city = config.balloon.city;
      }

      if (
        config.balloon?.zip !== undefined &&
        config.balloon.zip !== getDefaultOptions().balloon?.zip
      ) {
        balloonDiff.zip = config.balloon.zip;
      }

      if (
        config.balloon?.addressName !== undefined &&
        config.balloon.addressName !== getDefaultOptions().balloon?.addressName
      ) {
        balloonDiff.addressName = config.balloon.addressName;
      }

      if (
        config.balloon?.street !== undefined &&
        config.balloon.street !== getDefaultOptions().balloon?.street
      ) {
        balloonDiff.street = config.balloon.street;
      }

      if (
        config.balloon?.number !== undefined &&
        config.balloon.number !== getDefaultOptions().balloon?.number
      ) {
        balloonDiff.number = config.balloon.number;
      }

      if (
        config.balloon?.country !== undefined &&
        config.balloon.country !== getDefaultOptions().balloon?.country
      ) {
        balloonDiff.country = config.balloon.country;
      }

      if (Object.keys(balloonDiff).length > 0) {
        serial.balloon = balloonDiff as PluginConfig['balloon'];
      }

      return serial;
    },
    /**
     * should return the plugins state
     * @param {boolean} forUrl
     * @returns {PluginState}
     */
    getState(forUrl?: boolean): PluginState {
      // eslint-disable-next-line no-console
      console.log('Called when collecting state, e.g. for create link', forUrl);
      return {
        prop: '*',
      };
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [];
    },
    destroy(): void {
      // eslint-disable-next-line no-console
      console.log('hook to cleanup');
    },
  };
}
