import React, { useState, useCallback, ReactNode } from "react";
import { FlatList, Text, View } from "react-native";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

type DataLoaderProps<T> = {
  fetchResult: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  };
  pullToRefresh?: boolean;
  children: (
    data: T,
    refreshing?: boolean,
    onRefresh?: () => void,
  ) => ReactNode;
};

export default function DataLoader<T>({
  fetchResult,
  children,
  pullToRefresh = false,
}: DataLoaderProps<T>) {
  const { data, loading, error, refetch } = fetchResult;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!data) return null;

  return children(
    data,
    pullToRefresh ? refreshing : undefined,
    pullToRefresh ? onRefresh : undefined,
  );
}
