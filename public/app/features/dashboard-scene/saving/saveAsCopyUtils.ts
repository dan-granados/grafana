import { type ObjectMeta } from 'app/features/apiserver/types';

const COPY_SUFFIX = ' Copy';

/**
 * Save-as-copy titles use a trailing " Copy". Do not append it twice if the
 * scene title was already renamed when the drawer opened.
 */
export function getDashboardCopyTitle(title: string): string {
  return title.endsWith(COPY_SUFFIX) ? title : `${title}${COPY_SUFFIX}`;
}

/**
 * Create must not send k8s identity or the API treats save-as-copy as an update
 * of the source dashboard.
 */
export function stripK8sIdentity(k8s?: Partial<ObjectMeta>): Partial<ObjectMeta> | undefined {
  if (!k8s?.annotations || Object.keys(k8s.annotations).length === 0) {
    return undefined;
  }

  return { annotations: k8s.annotations };
}
