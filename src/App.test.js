import { render, screen } from '@testing-library/react';
import App from './App';

test('renders headline', () => {
  render(<App />);
  const titleElement = screen.getByText(/AI Text Tools/i);
  expect(titleElement).toBeInTheDocument();
});
