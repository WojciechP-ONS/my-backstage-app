import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  fetchApiRef,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  MicrosoftCalendarApiClient,
  microsoftCalendarApiRef,
} from '@backstage/plugin-microsoft-calendar';

import { OnsRadar } from './tech_radar/onsRadarClient';
import { techRadarApiRef } from '@backstage/plugin-tech-radar';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),

  createApiFactory({
    api: microsoftCalendarApiRef,
    deps: { authApi: microsoftAuthApiRef, fetchApi: fetchApiRef },
    factory: deps => new MicrosoftCalendarApiClient(deps),
  }),
  
  ScmAuth.createDefaultApiFactory(),
  createApiFactory(techRadarApiRef, new OnsRadar()),

];