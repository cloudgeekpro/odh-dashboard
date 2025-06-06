import {
  Banner,
  Button,
  Checkbox,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Tooltip,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Content,
} from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useDevFlags } from '#~/app/useDevFeatureFlags';
import { definedFeatureFlags } from '#~/concepts/areas/const';
import { FeatureFlag } from '#~/concepts/areas/types';
import { DevFeatureFlags } from '#~/types';

type Props = {
  dashboardConfig: Record<FeatureFlag | string, boolean | undefined>;
} & DevFeatureFlags;

const DevFeatureFlagsBanner: React.FC<Props> = ({
  dashboardConfig,
  devFeatureFlags,
  setDevFeatureFlag,
  resetDevFeatureFlags,
  setDevFeatureFlagQueryVisible,
}) => {
  const devFlags = useDevFlags();
  const [isBannerHidden, setBannerHidden] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);

  if (!devFeatureFlags || isBannerHidden) {
    return null;
  }

  const renderFlags = (flags: string[], fallbackFlags?: Record<string, boolean | undefined>) => (
    <Grid hasGutter span={6} md={3}>
      {flags.toSorted().map((key) => {
        const value = devFeatureFlags[key] ?? fallbackFlags?.[key];
        return (
          <React.Fragment key={key}>
            <GridItem>
              <Checkbox
                id={key}
                data-testid={`${key}-checkbox`}
                label={key}
                isChecked={value ?? null}
                onChange={(_, checked) => {
                  setDevFeatureFlag(key, checked);
                }}
              />
            </GridItem>
            <GridItem data-testid={`${key}-value`}>{`${value ?? ''}${
              key in devFeatureFlags ? ' (overridden)' : ''
            }`}</GridItem>
          </React.Fragment>
        );
      })}
    </Grid>
  );
  return (
    <>
      <Banner color="blue">
        <Split>
          <SplitItem isFilled>
            Feature flags are{' '}
            <Button
              data-testid="override-feature-flags-button"
              variant="link"
              isInline
              onClick={() => {
                setModalOpen(true);
                setDevFeatureFlagQueryVisible(true);
              }}
            >
              overridden
            </Button>{' '}
            in the current session.{' '}
            <Button
              data-testid="reset-feature-flags-button"
              variant="link"
              isInline
              onClick={() => resetDevFeatureFlags(true)}
            >
              Click here
            </Button>{' '}
            to reset back to defaults.
          </SplitItem>
          <SplitItem>
            <Tooltip content="Close the banner and keep feature flag overrides active. Refresh the page to reveal the banner.">
              <Button
                data-testid="hide-banner-button"
                variant="link"
                isInline
                onClick={() => setBannerHidden(true)}
                icon={<CloseIcon />}
                aria-label="hide banner"
              />
            </Tooltip>
          </SplitItem>
        </Split>
      </Banner>
      {isModalOpen ? (
        <Modal
          data-testid="dev-feature-flags-modal"
          variant="large"
          isOpen
          onClose={() => {
            setModalOpen(false);
            setDevFeatureFlagQueryVisible(false);
          }}
        >
          <ModalHeader title="Override Flags" />
          <ModalBody>
            <Content component="h2">Feature Flags</Content>
            <Content component="p">
              Feature flags default to the values defined in the dashboard config.
            </Content>
            {renderFlags(definedFeatureFlags, dashboardConfig)}

            {devFlags.length > 0 ? (
              <>
                <Content component="h2">Dev Flags</Content>
                <Content component="p">
                  Dev flags default to inactive and can only be changed for the current session.
                </Content>
                {renderFlags(devFlags)}
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              data-testid="reset-feature-flags-modal-button"
              key="confirm"
              variant="link"
              onClick={() => resetDevFeatureFlags(false)}
            >
              Reset to defaults
            </Button>
          </ModalFooter>
        </Modal>
      ) : null}
    </>
  );
};

export default DevFeatureFlagsBanner;
