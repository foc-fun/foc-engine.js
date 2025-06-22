import { getFocEngineUrl } from './utils';

export class Engine {
  public url: string;

  constructor(network: string) {
    this.url = getFocEngineUrl(network);
  }
}
