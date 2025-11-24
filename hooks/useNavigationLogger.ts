import { useEffect, useRef } from 'react';
import { useSegments, useGlobalSearchParams } from 'expo-router';
import { logger } from '@top/lib/utils/logger';

export function useNavigationLogger() {
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const lastLogRef = useRef<string>('');

  useEffect(() => {
    // Build file path from segments
    const buildFilePath = (segments: string[]): string => {
      if (!segments || segments.length === 0) {
        return '/app/index.tsx';
      }

      // Replace dynamic segments (numbers/UUIDs) with [id]
      const processedSegments = segments.map(segment => {
        // Check if segment is a UUID
        if (/^[a-f0-9-]{36}$/i.test(segment)) return '[id]';
        // Check if segment is numeric
        if (/^\d+$/.test(segment)) return '[id]';
        return segment;
      });

      // Join segments and add file extension
      const path = processedSegments.join('/');
      return `/app/${path}.tsx`;
    };

    const filePath = buildFilePath(segments);

    // Build params string
    const paramsStr =
      Object.keys(params).length > 0
        ? ` {${Object.entries(params)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}}`
        : '';

    const logMessage = `${filePath}${paramsStr}`;

    // Prevent duplicate logs (due to React Strict Mode)
    if (logMessage !== lastLogRef.current) {
      logger.log(logMessage);
      lastLogRef.current = logMessage;
    }
  }, [segments, params]);
}
