import { finishProfile, getProfileStatus } from '@/apis/accounts/self';
import { FinishProfileRequest } from '@/requests/accounts/self/FinishProfileRequest';
import { create } from 'zustand';

interface ProfileState {
  status: null | 'complete' | 'setup-required';

  getStatus: () => Promise<void>;
  clearStatus: () => void;
  finish: (req: FinishProfileRequest) => Promise<void>;
}

const useProfile = create<ProfileState>((set) => ({
  status: null,

  async getStatus() {
    const res = await getProfileStatus();
    set({
      status: res.status,
    });
  },

  clearStatus() {
    set({
      status: null,
    });
  },

  async finish(req) {
    await finishProfile(req);
  },
}));

export default useProfile;
