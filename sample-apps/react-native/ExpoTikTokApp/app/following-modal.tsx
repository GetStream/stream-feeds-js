import { FollowsWrapper } from '@/components/FollowsWrapper';
import { Following } from '@/components/Following';

const FollowersModal = () => {
  return (
    <FollowsWrapper groupId='timeline'>
      <Following />
    </FollowsWrapper>
  );
};

export default FollowersModal;
