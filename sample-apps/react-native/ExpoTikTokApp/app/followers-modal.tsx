import { Followers } from '@/components/follows/Followers';
import { FollowsWrapper } from '@/components/follows/FollowsWrapper';

const FollowersModal = () => {
  return (
    <FollowsWrapper groupId='user'>
      <Followers />
    </FollowsWrapper>
  );
};

export default FollowersModal;
