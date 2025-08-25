import { FollowsWrapper } from '@/components/follows/FollowsWrapper';
import { Following } from '@/components/follows/Following';

const FollowersModal = () => {
  return (
    <FollowsWrapper groupId='timeline'>
      <Following />
    </FollowsWrapper>
  );
};

export default FollowersModal;
