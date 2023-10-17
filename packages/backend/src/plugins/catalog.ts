import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  GithubDiscoveryProcessor,
  GithubOrgReaderProcessor,
} from '@backstage/plugin-catalog-backend-module-github';
import {
  ScmIntegrations,
  DefaultGithubCredentialsProvider,
} from '@backstage/integration';
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
  const integrations = ScmIntegrations.fromConfig(env.config);
  const githubCredentialsProvider =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  builder.addProcessor(
    GithubDiscoveryProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
    GithubOrgReaderProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
  );
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  
  await processingEngine.start();
  return router;
}
