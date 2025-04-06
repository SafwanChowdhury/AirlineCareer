// src/lib/hooks/use-search.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface SearchOptions {
  /**
   * Initial search term
   */
  initialTerm?: string;
  
  /**
   * Delay in milliseconds before search is triggered
   */
  debounceTime?: number;
  
  /**
   * Minimum number of characters required to trigger search
   */
  minLength?: number;
  
  /**
   * Callback function to execute when search is triggered
   */
  onSearch?: (term: string) => void;
  
  /**
   * Convert search term to lowercase
   */
  toLowerCase?: boolean;
  
  /**
   * Trim whitespace from search term
   */
  trimWhitespace?: boolean;
}

export interface SearchResult {
  /**
   * Current search term
   */
  searchTerm: string;
  
  /**
   * Function to update search term
   */
  setSearchTerm: (term: string) => void;
  
  /**
   * Clear search term
   */
  clearSearch: () => void;
  
  /**
   * Execute search immediately
   */
  executeSearch: () => void;
  
  /**
   * Is search currently being debounced
   */
  isDebouncing: boolean;
  
  /**
   * Is search term valid for searching
   */
  isValidSearch: boolean;
}

/**
 * Hook for handling search with debouncing
 * Provides a standardized interface for search operations
 */
export function useSearch({
  initialTerm = '',
  debounceTime = 500,
  minLength = 0,
  onSearch,
  toLowerCase = true,
  trimWhitespace = true
}: SearchOptions = {}): SearchResult {
  // State
  const [searchTerm, setSearchTermInternal] = useState(initialTerm);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedTermRef = useRef<string>(initialTerm);
  const lastProcessedTerm = useRef<string>(initialTerm);
  
  // Process search term
  const processSearchTerm = useCallback((term: string): string => {
    let processed = term;
    
    if (trimWhitespace) {
      processed = processed.trim();
    }
    
    if (toLowerCase) {
      processed = processed.toLowerCase();
    }
    
    return processed;
  }, [toLowerCase, trimWhitespace]);
  
  // Check if search term is valid
  const isValidSearch = searchTerm.length >= minLength;
  
  // Execute search immediately
  const executeSearch = useCallback(() => {
    const processedTerm = processSearchTerm(searchTerm);
    
    // Only trigger search if term has changed
    if (processedTerm !== lastSearchedTermRef.current || !lastSearchedTermRef.current) {
      if (onSearch && isValidSearch) {
        onSearch(processedTerm);
      }
      lastSearchedTermRef.current = processedTerm;
    }
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    setIsDebouncing(false);
  }, [searchTerm, onSearch, processSearchTerm, isValidSearch]);
  
  // Update search term with debounce
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermInternal(term);
    setIsDebouncing(true);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      executeSearch();
    }, debounceTime);
  }, [debounceTime, executeSearch]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTermInternal('');
    
    if (onSearch) {
      onSearch('');
    }
    
    lastSearchedTermRef.current = '';
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    setIsDebouncing(false);
  }, [onSearch]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [initialTerm, minLength, onSearch, processSearchTerm]);
  
  // Trigger search on mount if we have an initial term
  useEffect(() => {
    if (initialTerm && onSearch && initialTerm.length >= minLength) {
      onSearch(processSearchTerm(initialTerm));
      lastSearchedTermRef.current = processSearchTerm(initialTerm);
    }
  }, [initialTerm, minLength, onSearch, processSearchTerm]);
  
  // Process search term when it changes
  useEffect(() => {
    // Skip effect if we have no onSearch or the term is too short
    if (!onSearch || searchTerm.length < minLength) {
      return;
    }
    
    // Skip if debouncing is active (the debounce timeout will handle it)
    if (isDebouncing && debounceTimerRef.current) {
      return;
    }
    
    const processedTerm = processSearchTerm(searchTerm);
    
    // Skip if term is the same as last processed
    if (processedTerm === lastProcessedTerm.current) {
      return;
    }
    
    // Update last processed term
    lastProcessedTerm.current = processedTerm;
    
    // We don't execute search here, as it will be handled by the debounce timer
    // or the executeSearch function
  }, [searchTerm, minLength, onSearch, processSearchTerm, isDebouncing]);
  
  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    executeSearch,
    isDebouncing,
    isValidSearch
  };
}