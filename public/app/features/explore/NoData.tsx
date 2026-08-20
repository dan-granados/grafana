import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { t } from '@grafana/i18n';
import { Button, PanelContainer, useStyles2 } from '@grafana/ui';

export interface NoDataProps {
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const NoData = ({ hint, actionLabel, onAction }: NoDataProps) => {
  const styles = useStyles2(getStyles);
  return (
    <PanelContainer data-testid="explore-no-data" className={styles.wrapper}>
      <span className={styles.message}>{t('explore.no-data.message', 'No data')}</span>
      {hint && <p className={styles.hint}>{hint}</p>}
      {onAction && actionLabel && (
        <Button data-testid={selectors.pages.Explore.General.noDataTryQueryButton} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </PanelContainer>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    label: 'no-data-card',
    padding: theme.spacing(3),
    background: theme.colors.background.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: theme.spacing(1),
  }),
  message: css({
    fontSize: theme.typography.h2.fontSize,
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    color: theme.colors.text.disabled,
  }),
  hint: css({
    margin: 0,
    maxWidth: 480,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  }),
});
