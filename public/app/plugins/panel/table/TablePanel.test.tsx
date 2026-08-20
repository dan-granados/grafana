import { render, screen } from 'test/test-utils';
import userEvent from '@testing-library/user-event';

import { createDataFrame, FieldType, getDefaultTimeRange, LoadingState } from '@grafana/data';

import { getPanelProps } from '../test-utils';

import { TablePanel } from './TablePanel';
import { defaultOptions, type Options } from './panelcfg.gen';

jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  usePanelContext: () => ({
    canExecuteActions: () => false,
    onAddAdHocFilter: undefined,
  }),
}));

const frame = createDataFrame({
  name: 'A',
  fields: [
    { name: 'name', type: FieldType.string, values: ['zeta', 'alpha', 'mu'] },
    { name: 'value', type: FieldType.number, values: [3, 1, 2] },
  ],
});

function renderTable(optionsOverrides?: Partial<Options>) {
  const options: Options = {
    frameIndex: defaultOptions.frameIndex ?? 0,
    showHeader: defaultOptions.showHeader ?? true,
    ...optionsOverrides,
  };

  const props = getPanelProps<Options>(options, {
    data: {
      state: LoadingState.Done,
      series: [frame],
      timeRange: getDefaultTimeRange(),
    },
    fieldConfig: { defaults: {}, overrides: [] },
    height: 600,
    width: 800,
  });

  return { props, ...render(<TablePanel {...props} />) };
}

describe('TablePanel', () => {
  it('keeps header sort after options.sortBy is applied on rerender', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderTable({ sortBy: [] });

    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    const sortControl = nameHeader.querySelector('button') ?? nameHeader;
    await user.click(sortControl);

    expect(props.onOptionsChange).toHaveBeenCalled();
    const nextOptions = props.onOptionsChange.mock.calls.at(-1)?.[0] as Options;
    expect(nextOptions.sortBy).toEqual([{ displayName: 'name', desc: false }]);

    rerender(
      <TablePanel
        {...props}
        options={{
          ...props.options,
          sortBy: nextOptions.sortBy,
        }}
      />
    );

    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByText('alpha')).toBeInTheDocument();
  });
});
