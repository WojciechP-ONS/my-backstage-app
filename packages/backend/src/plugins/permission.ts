import {
  BackstageIdentityResponse,
} from '@backstage/plugin-auth-node';
import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { Router } from 'express';
import {
  catalogConditions,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  catalogEntityReadPermission, catalogEntityCreatePermission, catalogEntityDeletePermission
} from '@backstage/plugin-catalog-common/alpha';
import { PluginEnvironment } from '../types';


class OnlySMLAccess implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    console.log('checking request:')
    if (isPermission(request.permission, catalogEntityReadPermission,),(request.permission, catalogEntityCreatePermission),(request.permission, catalogEntityDeletePermission)) {
      const isEntityOwner = catalogConditions.isEntityOwner({
        claims: user?.identity.ownershipEntityRefs || [],
      });

      // Check if the ownershipEntityRefs contain the specified value
      const isOwnerAllowed = user?.identity.ownershipEntityRefs?.some(
        ref => ref === 'group:default/spp-sml'
      );

      if (isEntityOwner && isOwnerAllowed) {

        console.log('Allow:42')
        return {result: AuthorizeResult.ALLOW};
      } else {
        
        console.log('Deny:46')
        return {result: AuthorizeResult.DENY };
      }
    }

    // Default permission if the condition doesn't match
    console.log('Deny:55')
    return {result: AuthorizeResult.DENY };
  }
  
}


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new OnlySMLAccess(),
    identity: env.identity,
  });
}
