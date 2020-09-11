// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { UserSettings } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { DialogInfo, SDKKinds } from '@bfc/shared/src/types';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { isRegExRecognizerType, isLUISnQnARecognizerType } from '../../utils/dialogValidator';

import { customEventKey, intentTypeKey } from './constants';
import { intentStyles } from './styles';
import { validateEventName, validateIntentName, getLuDiagnostics, validateRegExPattern } from './validators';

export function resolveTriggerWidget(
  selectedType: string,
  dialogFile: DialogInfo | undefined,
  formData: TriggerFormData,
  setFormData: (data: TriggerFormData) => void,
  userSettings: UserSettings,
  projectId: string,
  dialogId: string
) {
  const isRegEx = isRegExRecognizerType(dialogFile);
  const isLUISnQnA = isLUISnQnARecognizerType(dialogFile);
  const showTriggerPhrase = selectedType === intentTypeKey && isLUISnQnA;

  const onNameChange = (e, name) => {
    const errors: TriggerFormDataErrors = {};
    errors.intent = validateIntentName(selectedType, name);
    if (showTriggerPhrase && formData.triggerPhrases) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
    errors.regEx = validateRegExPattern(selectedType, isRegEx, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  //Trigger phrase is optional
  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    if (body) {
      errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    } else {
      errors.triggerPhrases = '';
    }
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };

  const handleEventNameChange = (event: React.FormEvent, value?: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.event = validateEventName(selectedType, SDKKinds.OnDialogEvent, value || '');
    setFormData({
      ...formData,
      $kind: SDKKinds.OnDialogEvent,
      event: value || '',
      errors: { ...formData.errors, ...errors },
    });
  };

  const onIntentWidgetRegex = (
    <React.Fragment>
      <TextField
        data-testid="TriggerName"
        errorMessage={formData.errors.intent}
        label={formatMessage('What is the name of this trigger (RegEx)')}
        styles={intentStyles}
        onChange={onNameChange}
      />
      <TextField
        data-testid="RegExField"
        errorMessage={formData.errors.regEx}
        label={formatMessage('Please input regEx pattern')}
        onChange={onChangeRegEx}
      />
    </React.Fragment>
  );

  const onIntentWidgetLUISQnA = (
    <React.Fragment>
      <TextField
        data-testid="TriggerName"
        errorMessage={formData.errors.intent}
        label={formatMessage('What is the name of this trigger (LUIS)')}
        styles={intentStyles}
        onChange={onNameChange}
      />
      <Label>{formatMessage('Trigger phrases')}</Label>
      <LuEditor
        editorSettings={userSettings.codeEditor}
        errorMessage={formData.errors.triggerPhrases}
        height={225}
        luOption={{
          projectId,
          fileId: dialogId,
          sectionId: PlaceHolderSectionName,
        }}
        placeholder={inlineModePlaceholder}
        value={formData.triggerPhrases}
        onChange={onTriggerPhrasesChange}
      />
    </React.Fragment>
  );

  const onIntentWidgetCustom = (
    <TextField
      data-testid="TriggerName"
      errorMessage={formData.errors.intent}
      label={formatMessage('What is the name of this trigger')}
      styles={intentStyles}
      onChange={onNameChange}
    />
  );

  const onIntentWidget = isRegEx ? onIntentWidgetRegex : isLUISnQnA ? onIntentWidgetLUISQnA : onIntentWidgetCustom;

  const onEventWidget = (
    <TextField
      required
      data-testid="CustomEventName"
      errorMessage={formData.errors.event}
      label={formatMessage('What is the name of the custom event?')}
      styles={intentStyles}
      onChange={handleEventNameChange}
    />
  );

  let widget;
  switch (selectedType) {
    case intentTypeKey:
      widget = onIntentWidget;
      break;
    case customEventKey:
      widget = onEventWidget;
      break;
    default:
      break;
  }
  return widget;
}
