import React, { useEffect, useMemo } from 'react';
import {
  Image,
  Text,
  AppShell,
  Burger,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import {
  MdClose,
  MdPerson,
  MdHome,
  MdMessage,
  MdLogin,
  MdLogout,
} from 'react-icons/md';
import { IoMdPricetag } from 'react-icons/io';
import { useDisclosure } from '@mantine/hooks';
import { useLocation } from 'wouter';

import iconSrc from '@/assets/images/icon.png';

import useAuth from '@/lib/auth/stores/useAuth';
import useProfile from '@/stores/useProfile';
import NavButton, { NavButtonProps } from '@/components/nav/NavButton';

export default function MainLayout({ children }: React.PropsWithChildren) {
  const [opened, { open, close }] = useDisclosure();
  const auth = useAuth();
  const { status, getStatus, clearStatus } = useProfile();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    clearStatus();
    if (!auth.user) return;
    getStatus();
  }, [auth.user, getStatus, clearStatus]);

  useEffect(() => {
    if (status !== 'setup-required' && location !== '/profile/finish') return;
    setLocation('/profile/finish', { replace: true });
  }, [status, location, setLocation]);

  const menuItems = useMemo<NavButtonProps[]>(
    () => [
      {
        action: '/',
        icon: MdHome,
        text: 'Home',
      },
      // {
      //   action: '/map',
      //   icon: MdMap,
      //   text: 'Map',
      // },
      ...(auth.user
        ? [
            {
              action: '/messages',
              icon: MdMessage,
              text: 'Messages',
            },
            {
              action: '/dashboard',
              icon: IoMdPricetag,
              text: `Dashboard`,
            },
            // {
            //   action: '/profile',
            //   icon: MdPerson,
            //   text: 'Profile',
            // },
            {
              action: auth.logout,
              icon: MdLogout,
              text: 'Log out',
            },
          ]
        : [
            {
              action: auth.login,
              icon: MdLogin,
              text: 'Log in',
            },
          ]),
    ],
    [auth.user, auth.login, auth.logout],
  );

  return (
    <AppShell
      padding={'xl'}
      navbar={{
        width: 64,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <Burger opened={opened} onClick={open} hiddenFrom="sm" size="sm" />

      <AppShell.Navbar withBorder={false}>
        <Stack align="center" gap="sm" px="sm" py="sm">
          <Image
            src={iconSrc}
            alt="A market tent"
            radius="sm"
            visibleFrom="sm"
            aria-hidden
          />
          <Group align="center" justify="center" gap="sm" hiddenFrom="sm">
            <Image
              src={iconSrc}
              alt="A market tent"
              w="3em"
              h="3em"
              radius="sm"
              aria-hidden
            />
            <Text fz="2rem">SquareMarket</Text>
          </Group>
          <Button
            variant="light"
            size="lg"
            fz="1.25rem"
            onClick={close}
            hiddenFrom="sm"
            fullWidth
          >
            <MdClose />
          </Button>
          {menuItems.map((item, idx) => (
            <NavButton key={idx} {...item} />
          ))}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main
        styles={{ main: { display: 'flex', flexDirection: 'column' } }}
      >
        {auth.loaded ? children : null}
      </AppShell.Main>
    </AppShell>
  );
}
