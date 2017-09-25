import got from 'got';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';

export const resolvers = {
  DateTime: GraphQLDateTime,

  DateOnly: GraphQLDate,

  RootQuery: {
    async viewer(_: undefined, { fbAccessToken }: { fbAccessToken: string }) {
      // Get Facebook profile ID using the access token
      const response = await got('https://graph.facebook.com/me', {
        query: {
          access_token: fbAccessToken,
          fields: 'id',
        },
        json: true,
      });

      const fbId: string | undefined = response.body.id;

      if (fbId) {
        const db = await connection;
        const users = db.getRepository(User);

        return users.findOne({ where: { fbId } });
      }

      return undefined;
    },
    async notablePerson(_: undefined, { slug }: { slug: string }) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return npRepository.findOne({
        where: {
          slug,
        },
        relations: ['events'],
      });
    },
  },

  RootMutation: {
    async createUser(_: undefined, { data: { fbAccessToken } }: any) {
      type Profile = {
        id: string;
        name: string;
        email: string;
        picture: {
          is_silhouette: boolean;
          url: string;
        };
      };

      const profile: Profile = (await got('https://graph.facebook.com/me', {
        query: {
          access_token: fbAccessToken,
          fields: ['id', 'name', 'email', 'picture'],
        },
        json: true,
      })) as any;

      const db = await connection;
      const user = new User();

      user.fbId = profile.id;
      user.name = profile.name;
      user.email = profile.email;

      user.signedUpAt = new Date();

      db.entityManager.persist(user);
    },
  },
};
