import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple component to test
const SimpleComponent = () => {
  return <div>Hello World</div>;
};

describe('Simple Test', () => {
  it('should render a simple component', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});