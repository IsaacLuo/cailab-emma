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

export const PartType = new GraphQLObjectType({
  name: 'part',
  fields: {
    position: { type: GraphQLString },
    len: {type:GraphQLInt},
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


export const PartDefinitionType = new GraphQLObjectType({
  name: 'PartDefinitionType',
  fields: {
    _id: {
      type: GraphQLID,
    },
    owner: {
      type: GraphQLID,
    },
    group: {
      type: GraphQLString,
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
        defaultValue: { offset: 0, first: 1000 } 
      },
    posFilter: {
      type: GraphQLString,
      defaultValue: '',
    },
    categoryFilter: {
      type: GraphQLString,
      defaultValue: '',
    }
  },
  resolve (root, params, options) {
    const condition:any = {};
    if(params.posFilter!==null && params.posFilter!=='') {
      condition['part.position'] = params.posFilter;
    }
    if(params.categoryFilter!==null && params.categoryFilter!=='' &&  params.categoryFilter!=='All' ) {
      condition['part.category'] = params.categoryFilter;
    }
    return PartDefinition.find(condition).skip(params.pagination.offset).limit(params.pagination.first).sort('part.name').exec();
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
  args: {
    posFilter: {
      type: GraphQLString,
      defaultValue: '',
    },
    categoryFilter: {
      type: GraphQLString,
      defaultValue: '',
    }
  },
  resolve (root, params, options) {
    const condition:any = {};
    if(params.posFilter!==null && params.posFilter!=='') {
      condition['part.position'] = params.posFilter;
    }
    if(params.categoryFilter!==null && params.categoryFilter!=='' &&  params.categoryFilter!=='All' ) {
      condition['part.category'] = params.categoryFilter;
    }
    return PartDefinition.countDocuments(condition).exec();
  }
}




