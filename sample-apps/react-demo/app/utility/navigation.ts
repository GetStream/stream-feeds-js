import { useClientConnectedUser } from "@stream-io/feeds-react-sdk";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useNavigation = (href: string) => {
  const router = useRouter();
  const user = useClientConnectedUser();

  return useCallback(() => {
    router.push(`${href}?user_id=${user?.id}`);
  }, [router, href, user?.id]);
};