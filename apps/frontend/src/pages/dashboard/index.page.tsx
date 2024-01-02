import { Button, Stack, Tabs, Text } from '@mantine/core';
import { useCallback, useEffect } from 'react';
import { MdAdd, MdEdit, MdFolder } from 'react-icons/md';
import PageContainer from '@/components/page/Container';
import { Link } from 'wouter';
import useSellerDashboard from '@/stores/useSellerDashboard';
import AdvertisementCard from './components/AdvertisementCard';

export default function Dashboard() {
  const { draftAds, loadDrafts, publishedAds, loadPublished } =
    useSellerDashboard();

  const onTabChange = useCallback(
    (tab: string | null) => {
      switch (tab) {
        case 'drafts':
          loadDrafts();
          break;
        case 'ads':
          loadPublished();
          break;
      }
    },
    [loadDrafts, loadPublished],
  );

  useEffect(() => {
    onTabChange('ads');
  }, []);

  return (
    <PageContainer maw="1280px">
      <Stack gap="md">
        <Text component="h1" size="2rem">
          Seller dashboard
        </Text>
        <Tabs variant="pills" defaultValue="ads" onChange={onTabChange}>
          <Stack gap="md">
            <Tabs.List>
              <Tabs.Tab value="ads" rightSection={<MdFolder />}>
                Advertisements
              </Tabs.Tab>
              <Tabs.Tab value="drafts" rightSection={<MdEdit />}>
                Drafts
              </Tabs.Tab>
              <Link href="/dashboard/ads/create">
                <Button ml="auto" component="a" rightSection={<MdAdd />}>
                  Advertisement
                </Button>
              </Link>
            </Tabs.List>

            <Tabs.Panel value="ads">
              {publishedAds
                .map((ads) => (
                  <Stack gap="md">
                    {ads.map((ad) => (
                      <AdvertisementCard key={ad.uid} ad={ad} draft={false} />
                    ))}
                  </Stack>
                ))
                .pending(() => 'Loading published advertisements...')
                .catch(() => 'Error')
                .unwrap()}
            </Tabs.Panel>

            <Tabs.Panel value="drafts">
              {draftAds
                .map((ads) => (
                  <Stack gap="md">
                    {ads.map((ad) => (
                      <AdvertisementCard key={ad.uid} ad={ad} draft={true} />
                    ))}
                  </Stack>
                ))
                .pending(() => 'Loading drafts...')
                .catch(() => 'Error')
                .unwrap()}
            </Tabs.Panel>
          </Stack>
        </Tabs>
      </Stack>
    </PageContainer>
  );
}
