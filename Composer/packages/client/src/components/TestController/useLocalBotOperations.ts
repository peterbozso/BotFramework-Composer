// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPublishConfig } from '@bfc/shared';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { BotStatus } from '../../constants';
import { dispatcherState, rootBotProjectIdSelector } from '../../recoilModel';
import { botRuntimeOperationsSelector, buildConfigurationSelector } from '../../recoilModel/selectors';

import { useBotStatusTracker } from './useBotStatusTracker';

export function useBotOperations(onAllBotsStarted?: (started: boolean) => void) {
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const botRuntimeOperations = useRecoilValue(botRuntimeOperationsSelector);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const [trackedProjectIds, setProjectsToTrack] = useState<string[]>([]);
  const { updateSettingsForSkillsWithoutManifest, resetBotRuntimeError } = useRecoilValue(dispatcherState);

  const handleBotStart = async (projectId: string, config: IPublishConfig, botBuildRequired: boolean) => {
    resetBotRuntimeError(projectId);
    if (botBuildRequired) {
      // Default recognizer
      const matchedBuilder = builderEssentials.find(({ projectId: currentProjecId }) => projectId === currentProjecId);
      if (matchedBuilder?.dialogs) {
        await botRuntimeOperations?.buildWithDefaultRecognizer(projectId, {
          dialogs: matchedBuilder.dialogs,
          config,
        });
      }
    } else {
      // Regex recognizer
      await botRuntimeOperations?.startBot(projectId, config);
    }
  };

  const startRootBot = async () => {
    setProjectsToTrack([]);
    await updateSettingsForSkillsWithoutManifest();
    const rootBot = builderEssentials[0];
    const { projectId, configuration, buildRequired, status } = rootBot;
    if (status !== BotStatus.connected) {
      handleBotStart(projectId, configuration, buildRequired);
    }
  };

  // Custom hook to make sure root bot is started after all skills have been started.
  useBotStatusTracker(() => {
    startRootBot();
  }, trackedProjectIds);

  const startAllBots = async () => {
    const [, ...skillsBots] = builderEssentials;
    const trackProjects: string[] = skillsBots.map((skillBot) => skillBot.projectId);
    setProjectsToTrack(trackProjects);
    for (const botBuildConfig of skillsBots) {
      if (botBuildConfig.status !== BotStatus.connected) {
        const { projectId, configuration, buildRequired } = botBuildConfig;
        await handleBotStart(projectId, configuration, buildRequired);
      }
    }
    if (onAllBotsStarted) {
      onAllBotsStarted(true);
    }
  };

  const stopAllBots = () => {
    setProjectsToTrack([]);
    builderEssentials.forEach(({ projectId }) => botRuntimeOperations?.stopBot(projectId));
    if (onAllBotsStarted) {
      onAllBotsStarted(false);
    }
  };

  const startSingleBot = (projectId: string) => {
    if (projectId === rootBotId) {
      startRootBot();
    } else {
      const botData = builderEssentials.find((builder) => builder.projectId === projectId);
      if (botData) {
        handleBotStart(projectId, botData?.configuration, botData?.buildRequired);
      }
    }
  };

  const stopSingleBot = (projectId: string) => {
    botRuntimeOperations?.stopBot(projectId);
  };

  return {
    stopAllBots,
    startAllBots,
    startSingleBot,
    stopSingleBot,
  };
}
