import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar.jsx';

describe('ProgressBar', () => {
  it('expõe o progresso para tecnologias assistivas', () => {
    render(<ProgressBar current={4} total={10} />);
    const progress = screen.getByRole('progressbar', { name: /progresso da partida/i });
    expect(progress).toHaveAttribute('aria-valuenow', '4');
    expect(screen.getByText('4 de 10')).toBeInTheDocument();
  });
});

