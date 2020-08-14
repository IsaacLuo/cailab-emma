import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
// @modelOptions({ options: { customName: 'connectors' } })
class ConnectorClass {
  @prop()
  public x?: string;
}

export const Connector2 = getModelForClass(ConnectorClass);