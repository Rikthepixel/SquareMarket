import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function useRedirect(
  condition: () => boolean,
  to: string,
  replace?: boolean,
) {
  const [, setLocation] = useLocation();
  const shouldRedirect = condition();

  useEffect(() => {
    if (!shouldRedirect) return;
    setLocation(to, { replace });
  }, [shouldRedirect, to, replace, setLocation]);
}
