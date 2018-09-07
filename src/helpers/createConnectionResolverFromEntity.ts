import { FindManyOptions } from 'typeorm';
import { SchemaContext } from '../typings/schemaContext';
import { entities } from '../database/entities';
import { FnResolver } from '../typings/resolverMap';

type Connection<Node> = {
  edges: [
    {
      cursor: string;
      node: Node;
    }
  ];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

type ConnectionArgs<E extends ArrayElement<typeof entities>> = {
  after: string;
  first: number;
  where?: FindManyOptions<E>['where'];
};

type ArrayElement<T> = T extends Array<infer R> ? R : T;

export function createConnectionResolverFromEntity<
  E extends ArrayElement<typeof entities>,
  NodeType
>(
  entity: E,
  order: FindManyOptions<InstanceType<E>>['order'],
): FnResolver<Connection<NodeType>, any, ConnectionArgs<E>, SchemaContext> {
  return async (_, { after, first, where }, { connection }) => {
    if (typeof where === 'string') {
      throw new TypeError('`where` cannot be a string.');
    }

    const skip = typeof after === 'string' ? (Number(after) || 0) + 1 : 0;
    const query: FindManyOptions<InstanceType<E>> = {
      where: { ...(where as any) },
      order,
    };
    const repo = connection.getRepository<InstanceType<E>>(entity);

    const [nodes, all] = await repo.findAndCount({
      ...query,
      take: first,
      skip,
    });

    const edges = nodes.map((node, i) => ({
      node: node as NodeType,
      cursor: String(i + skip),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: skip + nodes.length < all,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  };
}
