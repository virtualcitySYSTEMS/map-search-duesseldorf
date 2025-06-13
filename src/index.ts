import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import getDefaultOptions from './defaultOptions.js';
import DuesseldorfSearch from './duesseldorfSearch';

type PluginConfig = Record<never, never>;
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
      vcsUiApp.search.add(
        new DuesseldorfSearch(vcsUiApp, { ...getDefaultOptions(), ...config }),
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
      // eslint-disable-next-line no-console
      console.log('Called when serializing this plugin instance');
      return {};
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
