import PageContainer from '@/components/page/Container';
import { useEffect } from 'react';
import useAdvertisementEditor from '@/stores/useAdvertisementEditor';
import { useLocation } from 'wouter';

export default function CreateAdPage() {
  const { create, created } = useAdvertisementEditor();
  const [, setLocation] = useLocation();

  useEffect(() => {
    create();
  }, [create]);

  useEffect(() => {
    const uid = created.unwrapValue()?.uid;
    if (!uid) return;
    setLocation(`/dashboard/ads/${uid}`, { replace: true });
  }, [created, setLocation]);

  return (
    <PageContainer>
      {created
        .map(() => 'Creating a new advertisement')
        .pending(() => 'Creating a new advertisement')
        .catch(
          () =>
            'Could not create a new advertisement. Reload or try again later',
        )
        .unwrap()}
    </PageContainer>
  );
}
