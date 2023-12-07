import { MaybePromise } from "@/helpers/MaybePromise";
import { ActionIcon, Button } from "@mantine/core";
import React, { useMemo } from "react";
import { IconType } from "react-icons";
import { Link, useRoute } from "wouter";

export interface NavButtonProps {
  /**
   * - Strings will be interpreted as urls for anchors
   * - Functions will be interpreted as onClicks for buttons
   */
  action: string | (() => MaybePromise<void>);
  text: string;
  icon: IconType;
}

const NavButton = ({ action, icon: Icon, text }: NavButtonProps) => {
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
export default NavButton
