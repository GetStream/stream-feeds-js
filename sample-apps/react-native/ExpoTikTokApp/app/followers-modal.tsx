import { Followers } from '@/components/Followers';
import { FollowsWrapper } from '@/components/FollowsWrapper';

const FollowersModal = () => {
  return (
    <FollowsWrapper groupId='user'>
      <Followers />
    </FollowsWrapper>
  );
};

export default FollowersModal;
