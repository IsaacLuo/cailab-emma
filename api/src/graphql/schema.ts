import { 
  partDefinition, 
  partDefinitions, 
  partDefinitionCount,
} from './PartDefinition';
import {
  plateDefinitions,
  plateDefinitionCount,
} from './PlateDefinition';
import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Queries',
    fields: {
      partDefinitions,
      partDefinition,
      partDefinitionCount,
      plateDefinitions,
      plateDefinitionCount,
    }
  })
})

