import { Button, Skeleton, Stack, Tabs, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdFolder } from 'react-icons/md';
import PageContainer from '@/components/page/Container';
import { Link } from 'wouter';
import useSellerDashboard from '@/stores/useSellerDashboard';
import AdvertisementCard from './components/AdvertisementCard';

export default function Dashboard() {
  const { draftAds, loadDrafts, publishedAds, loadPublished } =
    useSellerDashboard();

  const [tab, setTab] = useState<string>('ads');

  function onTabChange(tab: string | null) {
    setTab(tab ?? 'ads');
  }

  const reloadTab = useCallback(() => {
    switch (tab) {
      case 'drafts':
        loadDrafts();
        break;
      case 'ads':
        loadPublished();
        break;
    }
  }, [tab, loadDrafts, loadPublished]);

  useEffect(() => {
    reloadTab();
  }, [reloadTab]);

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
                .map((ads) => {
                  if (ads.length === 0) {
                    return "You don't have any published advertisements yet";
                  }

                  return (
                    <Stack gap="md">
                      {ads.map((ad) => (
                        <AdvertisementCard
                          key={ad.uid}
                          ad={ad}
                          draft={false}
                          onUnpublished={reloadTab}
                          onDeleted={reloadTab}
                        />
                      ))}
                    </Stack>
                  );
                })
                .pending(() => (
                  <Stack gap="md">
                    {Array(10)
                      .fill(true)
                      .map((_, idx) => (
                        <Skeleton key={idx} height="12rem" />
                      ))}
                  </Stack>
                ))
                .catch((err) => err.message)
                .unwrap()}
            </Tabs.Panel>

            <Tabs.Panel value="drafts">
              {draftAds
                .map((ads) => {
                  if (ads.length === 0) {
                    return "You don't have any draft advertisements yet ";
                  }

                  return (
                    <Stack gap="md">
                      {ads.map((ad) => (
                        <AdvertisementCard
                          key={ad.uid}
                          ad={ad}
                          draft={true}
                          onDeleted={reloadTab}
                        />
                      ))}
                    </Stack>
                  );
                })
                .pending(() => (
                  <Stack gap="md">
                    {Array(10)
                      .fill(true)
                      .map((_, idx) => (
                        <Skeleton key={idx} height="12rem" />
                      ))}
                  </Stack>
                ))
                .catch((err) => err.message)
                .unwrap()}
            </Tabs.Panel>
          </Stack>
        </Tabs>
      </Stack>
    </PageContainer>
  );
}
