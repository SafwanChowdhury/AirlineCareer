import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { ApiError } from '../api-utils';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false
};

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch data: ${response.statusText}`,
      response.status
    );
  }
  const json = await response.json();
  if (!json.success) {
    throw new ApiError(json.error || 'Unknown error occurred');
  }
  return json.data;
}

export function useSwrFetch<T>(
  url: string | null,
  config?: SWRConfiguration
): SWRResponse<T, Error> {
  return useSWR<T, Error>(
    url,
    fetcher,
    {
      ...defaultConfig,
      ...config
    }
  );
} 