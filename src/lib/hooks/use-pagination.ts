// src/lib/hooks/use-pagination.ts
import { useState, useEffect, useCallback } from 'react';
import { PaginationInfo } from '@/lib/types';

export interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
}

export interface PaginationResult {
  // Current state
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  
  // Items displayed
  startItem: number;
  endItem: number;
  
  // Navigation methods
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (limit: number) => void;
  
  // Query parameters
  getQueryParams: () => { page: string; limit: string };
  
  // Update from API response
  updateFromResponse: (pagination: PaginationInfo) => void;
  
  // Status
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Hook for managing pagination state across the application
 * Provides a standardized interface for handling pagination
 */
export function usePagination(options: PaginationOptions = {}): PaginationResult {
  // Default options
  const {
    initialPage = 1,
    initialLimit = 10,
    totalItems = 0,
  } = options;
  
  // State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [total, setTotal] = useState(totalItems);
  
  // Derived values
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);
  
  // Status flags
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;
  const canGoNext = !isLastPage;
  const canGoPrev = !isFirstPage;
  
  // Reset current page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);
  
  // Ensure the current page doesn't exceed total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Navigation methods
  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);
  
  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrev]);
  
  // Get URL query parameters
  const getQueryParams = useCallback(() => ({
    page: currentPage.toString(),
    limit: itemsPerPage.toString()
  }), [currentPage, itemsPerPage]);
  
  // Update pagination from API response
  const updateFromResponse = useCallback((pagination: PaginationInfo) => {
    setTotal(pagination.totalCount);
    // Only update current page if it comes from the server and is different
    if (pagination.currentPage && pagination.currentPage !== currentPage) {
      setCurrentPage(pagination.currentPage);
    }
    // Update items per page if it comes from the server and is different
    if (pagination.limit && pagination.limit !== itemsPerPage) {
      setItemsPerPage(pagination.limit);
    }
  }, [currentPage, itemsPerPage]);
  
  return {
    // Current state
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    
    // Items displayed
    startItem,
    endItem,
    
    // Navigation methods
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    
    // Query parameters
    getQueryParams,
    
    // Update from API response
    updateFromResponse,
    
    // Status
    canGoNext,
    canGoPrev,
    isFirstPage,
    isLastPage
  };
}