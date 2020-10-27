// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { LuisIntentEditor as LuIntentEditor } from './LuisIntentEditor';

const config: PluginConfig = {
  widgets: {
    recognizer: {
      LuIntentEditor,
    },
  },
  uiSchema: {
    [SDKKinds.OrchestratorRecognizer]: {
      recognizer: {
        disabled: false,
        displayName: () => formatMessage('Orchestrator'),
        intentEditor: 'LuIntentEditor',
        isSelected: (data) => {
          return typeof data === 'string' && data.endsWith('.oc');
        },
        seedNewRecognizer: (shellData, shellApi) => {
          //trigger the download of the model if needed
          //TODO: must check model exists when publishing as well
          fetch('/api/orchestrator/downloadModel');

          const { luFiles, currentDialog, locale } = shellData;
          const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

          if (!luFile) {
            alert(formatMessage(`NO LU FILE WITH NAME {id}`, { id: currentDialog.id }));
            return '';
          }

          try {
            //return `${luFile.id.split('.')[0]}.oc`;
            return { $kind: 'Microsoft.OrchestratorRecognizer' };
          } catch (err) {
            return '';
          }
        },
        renameIntent: async (intentName, newIntentName, shellData, shellApi) => {
          const { currentDialog, locale } = shellData;
          shellApi.updateIntentTrigger(currentDialog.id, intentName, newIntentName);
          await shellApi.renameLuIntent(`${currentDialog.id}.${locale}`, intentName, newIntentName);
        },
      },
    },
  },
};

export default config;
