import backend from "@/adapters/backend";
import { Button } from "@mantine/core";
import { useCallback } from "react";

export default function ProfilePage() {
  const onClick = useCallback(() => {
    backend.post("v1/accounts/self/setup")
  }, []);

  return <div>
    <Button onClick={onClick}>
      Send req
    </Button>
  </div>
}
