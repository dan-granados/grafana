import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTheme, type ThemeRegistryItem } from '@grafana/data';

import { ThemeCard } from './ThemeCard';

describe('ThemeCard', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: originalIntersectionObserver,
    });
  });

  function getMockTheme(build: ThemeRegistryItem['build'] = createTheme): ThemeRegistryItem {
    return {
      id: 'dark',
      name: 'Dark',
      build,
    };
  }

  it('should only call onSelect once when clicking the radio button dot', async () => {
    const onSelectMock = jest.fn();

    render(<ThemeCard themeOption={getMockTheme()} onSelect={onSelectMock} isSelected={false} />);

    // Find the radio button input element
    const radioButtonInput = screen.getByRole('radio');

    // Click the radio button
    await user.click(radioButtonInput);

    // Check that onSelect was called only once
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('does not build the theme preview before the card approaches the viewport', () => {
    const build = jest.fn(createTheme);

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      })),
    });

    render(<ThemeCard themeOption={getMockTheme(build)} onSelect={jest.fn()} isSelected={false} />);

    expect(build).not.toHaveBeenCalled();
  });
});
