import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { isInSystemRule } from './permission';

import { GithubEntityProvider, GithubOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-github';

export class GitHubManager {
  static githubEntityProviders : GithubEntityProvider[];
  static githubOrgEntityProvider : GithubOrgEntityProvider;
  static capture(githubEntityProviders: GithubEntityProvider[], githubOrgEntityProvider: GithubOrgEntityProvider) {
    GitHubManager.githubEntityProviders = githubEntityProviders;
    GitHubManager.githubOrgEntityProvider = githubOrgEntityProvider
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {

  const builder = await CatalogBuilder.create(env);

  const githubEntityProviders = GithubEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    schedule: env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 1 },
      timeout: { minutes: 15 },
    }),
  });
  const githubOrgEntityProvider = GithubOrgEntityProvider.fromConfig(env.config, {
    id: 'production',
    orgUrl: 'https://github.com/backstage-dummy-org',
    logger: env.logger,
    schedule: env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 1 },
      timeout: { minutes: 15 },
    }),
  });

  builder.addEntityProvider(githubEntityProviders);
  builder.addEntityProvider(githubOrgEntityProvider);
  
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  
  const { processingEngine, router } = await builder.build();

  await processingEngine.start();

  return router;
}