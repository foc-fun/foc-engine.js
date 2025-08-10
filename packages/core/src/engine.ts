import { getFocEngineUrl } from './utils';

export class FocEngine {
  public url: string;

  constructor(network: string, customUrl?: string) {
    this.url = customUrl || getFocEngineUrl(network);
  }
}
