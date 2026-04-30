import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FilePreviewType } from '../types/ml';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getExtensionFromFilename = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getExtensionFromUrl = (url: string): string => {
  const cleanUrl = url.split('?')[0];
  return cleanUrl.split('.').pop()?.toLowerCase() || '';
};

export const mapExtensionToFilePreviewType = (extension: string): FilePreviewType | null => {
  const ext = extension.toLowerCase();

  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'jfif'].includes(ext)) {
    return 'image';
  }

  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext)) {
    return 'video';
  }

  if (ext === 'pdf') {
    return 'pdf';
  }

  if (['doc', 'docx'].includes(ext)) {
    return 'doc';
  }

  return null;
};

export const mapExtensionToDocType = (extension: string): string => {
  const fileType = mapExtensionToFilePreviewType(extension);
  const ext = extension.toLowerCase();

  if (fileType === 'image') {
    return 'image';
  }

  if (fileType === 'video') {
    return 'video';
  }

  if (ext === 'pdf') {
    return 'pdf';
  }

  if (['doc', 'docx'].includes(ext)) {
    return 'document';
  }

  return ext || 'unknown';
};

export const getFileTypeFromExtension = (filename: string): FilePreviewType | null => {
  const extension = getExtensionFromFilename(filename);
  return mapExtensionToFilePreviewType(extension);
};

export const getDocTypeFromExtension = (filename: string): string => {
  const extension = getExtensionFromFilename(filename);
  return mapExtensionToDocType(extension);
};