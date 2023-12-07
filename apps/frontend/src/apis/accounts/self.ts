import backend from '@/adapters/backend';
import { FinishProfileRequest } from '@/requests/accounts/self/FinishProfileRequest';
import { ProfileStatusResponse } from '@/responses/accounts/self/ProfileStatusResponse';

export function getProfileStatus() {
  return backend.get('v1/accounts/self/status').json<ProfileStatusResponse>();
}

export function finishProfile(request: FinishProfileRequest) {
  return backend
    .post('v1/accounts/self/setup', {
      json: request,
    });
}
