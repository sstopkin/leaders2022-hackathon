import { BadRequestException, Type } from '@nestjs/common';
import { unescape } from 'querystring';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { conditionsTemplates, Order } from '../../constants';
import { FindAllOptionsDto } from '../../dto/find_all/find_all_options.dto';
import { SortDto } from '../../dto/find_all/sort.dto';

export const makeFindAllQuryBuilder = <Entity extends ObjectLiteral>(
  repository: Repository<Entity>,
  entity: Type<Entity>,
  options: FindAllOptionsDto,
  queryBuilder: SelectQueryBuilder<any> = null,
): SelectQueryBuilder<any> => {
  const entityName = entity.name;

  if (!queryBuilder) {
    queryBuilder = repository.createQueryBuilder(entityName);
  }

  const projectColumns = repository.metadata.ownColumns;
  const projectColumnNames = projectColumns.map(
    (column) => column.propertyName,
  );

  if (options.filter) {
    options.filterAnd.forEach((filter, index) => {
      if (!projectColumnNames.includes(filter.field)) {
        throw new BadRequestException(`Cannot filter by '${filter.field}'`);
      }
      const parameterName = `${filter.field}_${index}_AND`;
      queryBuilder
        .andWhere(
          conditionsTemplates.get(filter.condition)(
            filter.field,
            parameterName,
          ),
        )
        .setParameter(parameterName, unescape(filter.value));
    });
  }

  if (options.or) {
    options.filterOr.forEach((filter, index) => {
      if (!projectColumnNames.includes(filter.field)) {
        throw new BadRequestException(`Cannot filter by '${filter.field}'`);
      }
      const parameterName = `${filter.field}_${index}_OR`;
      queryBuilder
        .orWhere(
          conditionsTemplates.get(filter.condition)(
            filter.field,
            parameterName,
          ),
        )
        .setParameter(parameterName, unescape(filter.value));
    });
  }

  if (!options.sorting) {
    queryBuilder.addOrderBy(`${entityName}.id`, Order.ASC);
  } else {
    options.sorting.forEach((sort: SortDto) => {
      if (!projectColumnNames.includes(sort.field)) {
        throw new BadRequestException(`Cannot sort by '${sort.field}'`);
      }
      queryBuilder.addOrderBy(`${entityName}.${sort.field}`, sort.order);
    });
  }
  if (!!options.page && !!options.limit) {
    queryBuilder.skip(options.skip).take(options.limit);
  }

  return queryBuilder;
};
