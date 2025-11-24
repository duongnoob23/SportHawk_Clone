import React from 'react';
import { Image } from 'expo-image';
import { IconName, iconMap } from '@con/icons';
import { logger } from '@lib/utils/logger';

interface ShIconProps {
  name: IconName | undefined; // Allow undefined to catch errors
  size: number;
  color: string;
}

/**
 * A type-safe component for rendering all icons in the app.
 *
 * @param {ShIconProps} props - The component props.
 * @param {IconName} props.name - The identifier for the icon from the IconName enum.
 * @param {number} props.size - The size (width and height) of the icon.
 * @param {string} props.color - The tint color for the icon (must be from colorPalette).
 */
export const ShIcon = ({ name, size, color }: ShIconProps) => {
  // Early return for undefined/null names with detailed debugging
  if (name === undefined || name === null) {
    // Capture stack trace to find calling location
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n');

    let callerInfo = 'Unknown caller';
    for (let i = 2; i < stackLines.length && i < 6; i++) {
      const line = stackLines[i];
      if (!line.includes('ShIcon') && !line.includes('node_modules')) {
        const match =
          line.match(/\((.*?):(\d+):(\d+)\)/) ||
          line.match(/at\s+(.*?):(\d+):(\d+)/);
        if (match) {
          const [, file, lineNum, colNum] = match;
          const fileName = file.split('/').pop() || file;
          callerInfo = `${fileName}:${lineNum}:${colNum}`;
          break;
        }
      }
    }

    logger.warn(
      `ShIcon received undefined/null name. Called from: ${callerInfo}`
    );

    if (__DEV__) {
      console.warn('ShIcon undefined name debug:', {
        name: name,
        caller: callerInfo,
        hint: 'Check if the icon prop is being passed correctly or if the parent component has the icon value',
        stackTrace: stackLines.slice(2, 6).join('\n'),
      });
    }

    return null;
  }
  const iconAsset = iconMap[name];

  // This check is mostly for safety; TypeScript should prevent an invalid `name`.
  if (!iconAsset) {
    // Capture stack trace to find calling location
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n');

    // Find the first line that's not from ShIcon itself
    let callerInfo = 'Unknown caller';
    for (let i = 2; i < stackLines.length && i < 6; i++) {
      const line = stackLines[i];
      if (!line.includes('ShIcon') && !line.includes('node_modules')) {
        // Extract file and line number from stack trace
        const match =
          line.match(/\((.*?):(\d+):(\d+)\)/) ||
          line.match(/at\s+(.*?):(\d+):(\d+)/);
        if (match) {
          const [, file, lineNum, colNum] = match;
          // Get just the filename from the path
          const fileName = file.split('/').pop() || file;
          callerInfo = `${fileName}:${lineNum}:${colNum}`;
          break;
        }
      }
    }

    logger.warn(
      `Icon with name "${name}" does not exist. Called from: ${callerInfo}`
    );

    // Also log more detailed debugging info in development
    if (__DEV__) {
      console.warn('ShIcon Debug Info:', {
        providedName: name,
        typeOfName: typeof name,
        availableIcons: Object.keys(IconName).slice(0, 10).join(', ') + '...',
        caller: callerInfo,
        stackTrace: stackLines.slice(2, 6).join('\n'),
      });
    }

    return null;
  }

  return (
    <Image
      source={iconAsset.source}
      contentFit="contain"
      style={{
        width: size,
        height: size,
        tintColor: color,
      }}
    />
  );
};
