import { PaginationArgType } from './ArgTypes';
import { PartDefinition } from './../models';
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

const PartType = new GraphQLObjectType({
  name: 'part',
  fields: {
    position: { type: GraphQLString },
    name: { type: GraphQLString },
    labName: { type: GraphQLString },
    category: { type: GraphQLString },
    subCategory: { type: GraphQLString },
    comment: { type: GraphQLString },
    sequence: { type: GraphQLString },
    plasmidLength: { type: GraphQLInt },
    backboneLength: { type: GraphQLInt },
  }
})

// 定义Info的数据类型
let PartDefinitionType = new GraphQLObjectType({
  name: 'PartDefinitionType',
  fields: {
    _id: {
      type: GraphQLID,
    },
    permission: {
      type: GraphQLInt,
    },
    part: {
      type: PartType,
    },
  }
})



export const partDefinitions = {
  type: new GraphQLList(PartDefinitionType),
  args: {
    pagination: { 
      type: PaginationArgType, 
        defaultValue: { offset: 0, first: 10 } 
      },
  },
  resolve (root, params, options) {
    return PartDefinition.find({}).skip(params.pagination.offset).limit(params.pagination.first).exec();
  }
}


export const partDefinition = {
  type: PartDefinitionType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, params, options) {
    return PartDefinition.findOne({_id: params.id}).exec();
  }
}

export const partDefinitionCount = {
  type: GraphQLInt,
  resolve (root, params, options) {
    return PartDefinition.countDocuments().exec();
  }
}



