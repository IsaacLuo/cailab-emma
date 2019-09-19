import { 
  partDefinition, 
  partDefinitions, 
  partDefinitionCount,
} from './PartDefinition';
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
    }
  })
})

