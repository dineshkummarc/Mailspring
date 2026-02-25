import Config from '../config';

export default class ConfigMigrator {
  config: Config;

  constructor(config) {
    this.config = config;
  }

  migrate() {
    // Rename core.reading.backspaceDelete → core.reading.swipeDelete
    const oldVal = this.config.get('core.reading.backspaceDelete');
    if (oldVal !== undefined) {
      this.config.set('core.reading.swipeDelete', oldVal);
      this.config.set('core.reading.backspaceDelete', undefined);
    }
  }
}
