export const convertParamsToString = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value + '');
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};
