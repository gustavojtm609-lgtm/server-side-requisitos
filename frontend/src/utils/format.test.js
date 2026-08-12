import { describe, expect, it } from 'vitest';
import { formatDuration, initials } from './format.js';

describe('formatDuration', () => {
  it('formata milissegundos como minutos e segundos', () => {
    expect(formatDuration(83_420)).toBe('1:23');
  });

  it('não apresenta duração negativa', () => {
    expect(formatDuration(-1000)).toBe('0:00');
  });
});

describe('initials', () => {
  it('usa no máximo as duas primeiras partes do nome', () => {
    expect(initials('Ana Maria Souza')).toBe('AM');
  });
});

