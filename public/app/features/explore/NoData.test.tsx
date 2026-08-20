import { render, screen } from 'test/test-utils';
import userEvent from '@testing-library/user-event';

import { selectors } from '@grafana/e2e-selectors';

import { NoData } from './NoData';

describe('NoData', () => {
  it('renders the generic empty message without a starter action', () => {
    render(<NoData />);

    expect(screen.getByTestId('explore-no-data')).toHaveTextContent('No data');
    expect(screen.queryByTestId(selectors.pages.Explore.General.noDataTryQueryButton)).not.toBeInTheDocument();
  });

  it('renders a Prometheus starter hint and runs the action on click', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();

    render(<NoData hint="Enter a PromQL query, or try a starter metric." actionLabel="Try up" onAction={onAction} />);

    expect(screen.getByText('Enter a PromQL query, or try a starter metric.')).toBeInTheDocument();

    await user.click(screen.getByTestId(selectors.pages.Explore.General.noDataTryQueryButton));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
