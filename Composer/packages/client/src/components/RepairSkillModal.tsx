// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

import { repairSkillDialog } from '../constants';

export type RepairSkillModalFormData = 'repairSkill' | 'removeSkill';

export interface RepairSkillModalProps {
  skillId: string;
  onNext: (RepairSkillModalFormData) => void;
  onDismiss: () => void;
}

const optionKeys = {
  repairSkill: 'repairSkill',
  removeSkill: 'removeSkill',
};

export const CreateSkillModal: React.FC<RepairSkillModalProps> = ({ skillId, onNext, onDismiss }) => {
  const [option, setOption] = useState(optionKeys.repairSkill);

  const handleChange = (event, option) => {
    setOption(option.key);
  };

  const handleJumpToNext = () => {
    onNext(option);
  };

  const choiceOptions = [
    {
      ariaLabel:
        formatMessage('Locate the bot file and repair the link') +
        (option === optionKeys.repairSkill ? ' selected' : ''),
      key: optionKeys.repairSkill,
      'data-testid': 'Locate the bot file and repair the link',
      text: formatMessage('Locate the bot file and repair the link'),
    },
    {
      ariaLabel:
        formatMessage('Remove this skill from your project') + (option === optionKeys.removeSkill ? ' selected' : ''),
      key: optionKeys.removeSkill,
      'data-testid': 'Remove this skill from your project',
      text: formatMessage('Remove this skill from your project'),
    },
  ];

  return (
    <DialogWrapper isOpen onDismiss={onDismiss} {...repairSkillDialog(skillId)} dialogType={DialogTypes.DesignFlow}>
      <form onSubmit={handleJumpToNext}>
        <input style={{ display: 'none' }} type="submit" />
        <ChoiceGroup options={choiceOptions} selectedKey={option} onChange={handleChange} />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton data-testid="NextStepButton" text={formatMessage('Next')} onClick={handleJumpToNext} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateSkillModal;
