import { useState } from 'react';
import type { IPaginationState } from '../model/common/PaginationState';
import type { IRoleListRequest } from '../model/role/RoleRequestModel';

export function usePagination(initialParams: IRoleListRequest, setParams: React.Dispatch<React.SetStateAction<IRoleListRequest>>) {
  const defaultPage = Number(initialParams.page ?? 1);
  const defaultLimit = Number(initialParams.limit ?? 10);
  const [pagination, setPagination] = useState<Omit<IPaginationState, 'setPage' | 'chooseLimit'>>({
    page: defaultPage,
    limit: defaultLimit,
    totalItem: 0,
    totalPage: 1,
  });

  // Chuyển trang
  const setPage = (page: number) => setParams((prev) => ({ ...prev, page }));

  // Đổi số dòng/trang và về trang 1
  const chooseLimit = (limit: number) => setParams((prev) => ({ ...prev, limit, page: 1 }));

  // Cập nhật phân trang sau khi call API
  const updatePagination = (totalItem?: number, page?: number, limit?: number) => {
    setPagination({
      page: page ?? 1,
      limit: limit ?? 10,
      totalItem: totalItem ?? 0,
      totalPage: Math.max(1, Math.ceil((totalItem ?? 0) / (limit ?? 1))),
    });
  };
  //

  return {
    ...pagination,
    setPage,
    chooseLimit,
    updatePagination,
  };
}
