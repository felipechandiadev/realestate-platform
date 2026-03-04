export class ConfigOptionEntity {
  id: string;
  label: string;

  constructor(id: string, label: string) {
    this.id = id;
    this.label = label;
  }
}

export class CommuneOptionEntity extends ConfigOptionEntity {
  stateId: string;

  constructor(id: string, label: string, stateId: string) {
    super(id, label);
    this.stateId = stateId;
  }
}
