import { CatalogClient } from '@backstage/catalog-client';
import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { ScmIntegrations } from '@backstage/integration';
import { createNewAction } from './newaction';
import { DefaultGithubCredentialsProvider } from '@backstage/integration';

import { 
  createCreateMkdocsAction, 
  createCreateRulesetAction, 
  createEnableSecretScanningAction, 
  createGetBuildArtifactAction, 
  createRunGithubProvidersAction, 
  createUpdateMkdocsAction 
} from './scaffolder/githubScaffolderActions';

import { createGithubTemplateRepoCreateAction } from './scaffolder/github_templates/githubTemplateRepoCreate';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  const integrations = ScmIntegrations.fromConfig(env.config);
  const githubCredentialsProvider = DefaultGithubCredentialsProvider.fromIntegrations(integrations);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const customActions = [

    // GitHub
    createGithubTemplateRepoCreateAction({integrations, githubCredentialsProvider}),
    createUpdateMkdocsAction({integrations, githubCredentialsProvider}),
    createRunGithubProvidersAction(),
    createCreateMkdocsAction({integrations, githubCredentialsProvider}),
    createGetBuildArtifactAction({integrations, githubCredentialsProvider}),
    createCreateRulesetAction({integrations, githubCredentialsProvider}),
    createEnableSecretScanningAction({integrations, githubCredentialsProvider}),
  ];


const actions = [
  ...customActions,
  ...builtInActions,
  createNewAction(),
]

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    permissions: env.permissions,
  });
}
