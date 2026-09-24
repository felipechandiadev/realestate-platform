export class PredictStatusEntity {
  status: string;
  model_loaded: boolean;
  version: string;

  constructor(status: string, modelLoaded: boolean, version: string) {
    this.status = status;
    this.model_loaded = modelLoaded;
    this.version = version;
  }
}
