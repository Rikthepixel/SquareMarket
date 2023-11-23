import React, { useMemo } from 'react';
import {
  Image,
  Text,
  AppShell,
  Burger,
  ActionIcon,
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
import { IconType } from 'react-icons/lib';
import { useDisclosure } from '@mantine/hooks';
import { Link, useRoute } from 'wouter';

import iconSrc from '@/assets/images/icon.png';

import { MaybePromise } from '@/helpers/MaybePromise';
import useAuth from '@/lib/auth/stores/useAuth';

interface MenuItem {
  /**
   * - Strings will be interpreted as urls for anchors
   * - Functions will be interpreted as onClicks for buttons
   */
  action: string | (() => MaybePromise<void>);
  text: string;
  icon: IconType;
}

const NavButton = ({ action, icon: Icon, text }: MenuItem) => {
  const [isActive] = useRoute(
    typeof action === 'string' ? action : '/somerandomstringurl',
  );
  const isLink = typeof action === 'string';
  const commonProps = useMemo(
    () =>
      ({
        variant: isActive ? 'filled' : 'light',
        title: text,
        'aria-label': text,
        onClick: isLink ? undefined : action,
        component: isLink ? 'a' : undefined,
      }) as const,
    [isLink, action, text, isActive],
  );

  const Wrapper = (isLink
    ? Link
    : React.Fragment) as unknown as React.ComponentType<
    React.ComponentProps<'div'>
  >;
  const wrapperProps = isLink ? { href: action } : {};

  return (
    <>
      <Wrapper {...(wrapperProps as object)}>
        <ActionIcon {...commonProps} fz="1.5rem" size="xl" visibleFrom="sm">
          <Icon />
        </ActionIcon>
      </Wrapper>
      <Wrapper {...(wrapperProps as object)}>
        <Button
          {...commonProps}
          fz="1.25rem"
          size="lg"
          hiddenFrom="sm"
          fullWidth
          rightSection={<Icon />}
        >
          {text}
        </Button>
      </Wrapper>
    </>
  );
};

export default function MainLayout({ children }: React.PropsWithChildren) {
  const [opened, { open, close }] = useDisclosure();
  const auth = useAuth();

  const menuItems = useMemo<MenuItem[]>(
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
            {
              action: '/profile',
              icon: MdPerson,
              text: 'Profile',
            },
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
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
