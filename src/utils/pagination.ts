import { FindOptions } from "sequelize";

export const getPagination = (pageValue: unknown, limitValue: unknown) => {
  const page = Math.max(Number(pageValue) || 1, 1);
  const limit = Math.min(Math.max(Number(limitValue) || 10, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

export const paginationResponse = <T>(
  rows: T[],
  count: number,
  page: number,
  limit: number
) => ({
  items: rows,
  pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
});

export const paginationOptions = (query: Record<string, unknown>): Pick<FindOptions, "limit" | "offset"> => {
  const { limit, offset } = getPagination(query.page, query.limit);
  return { limit, offset };
};
