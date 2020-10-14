// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

import { botProjectSpaceSelector } from '../../recoilModel';

import { BotStatusIndicator } from './BotStatusIndicator';
import { BotRuntimeOperation } from './BotRuntimeOperation';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 350px;
    position: relative;
    overflow: hidden;
  `,
};

export const actionButton = css`
  font-size: 14px;
  margin-top: 2px;
  color: #0078d4;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

const rowHeader = { display: 'flex', alignItems: 'center' };

// eslint-disable-next-line react/display-name

interface IStartBotsDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const StartBotsDialog: React.FC<IStartBotsDialogProps> = (props) => {
  const { isOpen, onDismiss } = props;
  const projectCollection = useRecoilValue(botProjectSpaceSelector);
  const [items, setItems] = useState<{ displayName: string; projectId: string }[]>([]);
  const [allBotsStarted, setAllBotsStarted] = useState<boolean>(false);

  useEffect(() => {
    const result = projectCollection.map(({ name, projectId }) => ({ displayName: name, projectId }));
    setItems(result);
  }, [projectCollection]);

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div>{defaultRender && defaultRender(props)}</div>;
  };

  const startAllBots = () => {
    setAllBotsStarted(true);
  };

  const stopAllBots = () => {
    setAllBotsStarted(false);
  };

  const tableColumns: any = [
    {
      key: 'botName',
      name: formatMessage('Bot'),
      fieldName: 'id',
      isRowHeader: true,
      isResizable: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item: { displayName: string; projectId: string }) => {
        return <BotRuntimeOperation displayName={item.displayName} projectId={item.projectId} />;
      },
      isPadded: true,
    },
    {
      key: 'status',
      name: formatMessage('Status'),
      fieldName: 'type',
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      data: 'string',
      onRender: (item: { displayName: string; projectId: string }) => {
        return <BotStatusIndicator projectId={item.projectId} />;
      },
      isPadded: true,
    },
  ];

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Local bot runtime manager'),
        styles: dialog,
      }}
      hidden={!isOpen}
      maxWidth={700}
      minWidth={700}
      modalProps={{
        isBlocking: false,
        isModeless: true,
      }}
      onDismiss={onDismiss}
    >
      <div css={styles.detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <ActionButton css={actionButton}>
            {allBotsStarted ? (
              <button onClick={stopAllBots}> Stop all Bots </button>
            ) : (
              <button onClick={startAllBots}>Start all bots</button>
            )}
          </ActionButton>

          <DetailsList
            columns={tableColumns}
            compact={false}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            onRenderRow={onRenderRow}
          />
        </ScrollablePane>
      </div>
      <DialogFooter>
        <DefaultButton data-testid={'start-bots-dialog'} text={formatMessage('Close')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};