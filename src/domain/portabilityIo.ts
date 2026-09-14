import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { serializeExportSnapshot } from '../domain/export';
import type { ExportSnapshot } from '../domain/exportSchema';
import {
  parseAndValidateExportJson,
  type ImportValidationResult,
} from '../domain/import';

const EXPORT_FILENAME = 'ultraload-export.json';

export async function shareExportSnapshot(
  snapshot: ExportSnapshot,
): Promise<'shared' | 'unavailable'> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return 'unavailable';
  }

  const file = new File(Paths.cache, EXPORT_FILENAME);
  file.create({ overwrite: true });
  file.write(serializeExportSnapshot(snapshot));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'export ultraload data',
    UTI: 'public.json',
  });

  return 'shared';
}

export type PickImportResult =
  | { status: 'canceled' }
  | { status: 'validated'; result: ImportValidationResult }
  | { status: 'read_error'; message: string };

export async function pickAndValidateImportFile(): Promise<PickImportResult> {
  const pick = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'public.json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (pick.canceled || pick.assets == null || pick.assets.length === 0) {
    return { status: 'canceled' };
  }

  const asset = pick.assets[0];
  if (asset == null) {
    return { status: 'canceled' };
  }

  try {
    const file = new File(asset.uri);
    const text = await file.text();
    return {
      status: 'validated',
      result: parseAndValidateExportJson(text),
    };
  } catch {
    return {
      status: 'read_error',
      message: 'could not read the selected file.',
    };
  }
}
