import axios from 'axios';
import * as general from '../models/generalModel.js';
import { env } from '../config/env.js';

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}

export async function seedMedicinesIfEmpty() {
  if (await general.medicineCount() > 0 || !env.medicineDatasetUrl) return;
  console.log('[medicine] importing dataset');
  const response = await axios.get(env.medicineDatasetUrl, { timeout: 30000, responseType: 'text' });
  const lines = String(response.data).split(/\r?\n/).filter((line) => line.trim()).slice(1);
  let count = 0;
  for (const line of lines) {
    const cols = parseCsvLine(line);
    const name = (cols[1] || '').trim();
    if (name) { await general.insertMedicine(name); count += 1; }
  }
  console.log('[medicine] imported', count);
}
