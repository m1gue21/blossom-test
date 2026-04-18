import { characterResolvers } from './characterResolvers';

/** GraphQL String + Sequelize Date: without this, Date serializes as a number → string "1234567890" and the client shows Invalid Date. */
function dateToIsoString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString();
  if (typeof value === 'string') {
    const t = value.trim();
    if (/^\d+$/.test(t)) return new Date(Number(t)).toISOString();
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

export const resolvers = {
  Query: {
    ...characterResolvers.Query,
  },
  Mutation: {
    ...characterResolvers.Mutation,
  },
  Comment: {
    createdAt: (parent: { createdAt?: unknown }) => dateToIsoString(parent.createdAt),
  },
};
