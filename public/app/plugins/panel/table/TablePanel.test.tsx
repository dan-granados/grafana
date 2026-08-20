import { render, screen } from 'test/test-utils';
import userEvent from '@testing-library/user-event';

import { createDataFrame, FieldType, getDefaultTimeRange, LoadingState } from '@grafana/data';
import { TableNG } from '@grafana/ui/unstable';

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

jest.mock('@grafana/ui/unstable', () => {
  const actual = jest.requireActual('@grafana/ui/unstable');
  return {
    ...actual,
    TableNG: jest.fn((props: { onSortByChange?: (sortBy: Options['sortBy']) => void; sortByBehavior?: string }) => (
      <button
        data-testid="mock-table-sort"
        data-sort-behavior={props.sortByBehavior}
        onClick={() => props.onSortByChange?.([{ displayName: 'name', desc: false }])}
      >
        sort
      </button>
    )),
  };
});

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
  it('uses managed sort so header clicks persist via options.sortBy', async () => {
    const user = userEvent.setup();
    const { props } = renderTable({ sortBy: [] });

    expect(screen.getByTestId('mock-table-sort')).toHaveAttribute('data-sort-behavior', 'managed');
    expect(TableNG).toHaveBeenCalledWith(expect.objectContaining({ sortByBehavior: 'managed' }), undefined);

    await user.click(screen.getByTestId('mock-table-sort'));

    expect(props.onOptionsChange).toHaveBeenCalled();
    const nextOptions = props.onOptionsChange.mock.calls.at(-1)?.[0] as Options;
    expect(nextOptions.sortBy).toEqual([{ displayName: 'name', desc: false }]);
  });
});
