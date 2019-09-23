import { PaginationArgType } from './ArgTypes';
import { PartDefinition, PlateDefinition } from '../models';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  isOutputType,
  GraphQLInputObjectType
} from 'graphql';
import { PartType, PartDefinitionType } from './PartDefinition';

let UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: {
    _id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLID,
    },
  }
})

export const PlateDefinitionType = new GraphQLObjectType({
  name: 'plate',
  fields: {
    _id: {type: GraphQLID},
    owner: { type: UserType },
    group: { type: GraphQLString }, 
    permission: { type: GraphQLInt },
    plateType: { type: GraphQLString },
    name: { type: GraphQLString },
    barcode: { type: GraphQLString },
    description: {type: GraphQLString},
    parts: { type: new GraphQLList(PartDefinitionType) },
  }
})

export const plateDefinitions = {
  type: new GraphQLList(PlateDefinitionType),
  args: {
    pagination: { 
      type: PaginationArgType, 
        defaultValue: { offset: 0, first: 10 } 
      },
  },
  resolve (root, params, options) {
    console.log(root, params, options)
    return PlateDefinition
      .find({})
      .skip(params.pagination.offset)
      .limit(params.pagination.first)
      .populate('parts')
      .exec();
  }
}


// export const partDefinition = {
//   type: PartDefinitionType,
//   args: {
//     id: {
//       name: 'id',
//       type: new GraphQLNonNull(GraphQLID)
//     }
//   },
//   resolve (root, params, options) {
//     return PartDefinition.findOne({_id: params.id}).exec();
//   }
// }

export const plateDefinitionCount = {
  type: GraphQLInt,
  resolve (root, params, options) {
    return PlateDefinition.countDocuments().exec();
  }
}




