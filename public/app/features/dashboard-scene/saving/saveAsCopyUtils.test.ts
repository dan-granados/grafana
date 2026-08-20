import { AnnoKeyIgnorePredefinedVariables } from 'app/features/apiserver/types';

import { getDashboardCopyTitle, stripK8sIdentity } from './saveAsCopyUtils';

describe('getDashboardCopyTitle', () => {
  it('appends Copy to a dashboard title', () => {
    expect(getDashboardCopyTitle('CPU')).toBe('CPU Copy');
  });

  it('does not append Copy twice', () => {
    expect(getDashboardCopyTitle('CPU Copy')).toBe('CPU Copy');
  });
});

describe('stripK8sIdentity', () => {
  it('drops name and resourceVersion so save-as-copy cannot PUT the source', () => {
    expect(
      stripK8sIdentity({
        name: 'source-uid',
        resourceVersion: '9',
        generation: 3,
        annotations: { [AnnoKeyIgnorePredefinedVariables]: 'global' },
      })
    ).toEqual({
      annotations: { [AnnoKeyIgnorePredefinedVariables]: 'global' },
    });
  });

  it('returns undefined when there is nothing to forward', () => {
    expect(stripK8sIdentity({ name: 'source-uid', resourceVersion: '9' })).toBeUndefined();
    expect(stripK8sIdentity(undefined)).toBeUndefined();
  });
});
