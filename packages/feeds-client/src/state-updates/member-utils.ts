import { FeedMember } from '../gen/models';

export const addMemberToState = (
  member: FeedMember,
  members: FeedMember[],
  invites: FeedMember[],
) => {
  const memberIndex = members.findIndex((m) => m.user?.id === member?.user?.id);
  const inviteIndex = invites.findIndex((i) => i.user?.id === member?.user?.id);
  const result = { changed: false, members, invites };

  if (memberIndex === -1 && member.status !== 'rejected') {
    const updatedMembers = [...members, member];
    result.changed = true;
    result.members = updatedMembers;
  }

  if (
    inviteIndex === -1 &&
    (member.status === 'pending' || member.status === 'rejected')
  ) {
    const updatedInvites = [...invites, member];
    result.changed = true;
    result.invites = updatedInvites;
  }

  return result;
};

export const updateMemberInState = (
  member: FeedMember,
  members: FeedMember[],
  invites: FeedMember[],
) => {
  const memberIndex = members.findIndex((m) => m.user?.id === member.user?.id);
  const inviteIndex = invites.findIndex((i) => i.user?.id === member.user?.id);
  const result = { changed: false, members, invites };

  if (memberIndex === -1 && member.status !== 'rejected') {
    const updatedMembers = [...members, member];
    result.changed = true;
    result.members = updatedMembers;
  } else if (memberIndex !== -1 && member.status === 'rejected') {
    const updatedMembers = [...members];
    updatedMembers.splice(memberIndex, 1);
    result.changed = true;
    result.members = updatedMembers;
  } else if (memberIndex !== -1 && member.status !== 'rejected') {
    const updatedMembers = [...members];
    updatedMembers[memberIndex] = member;
    result.changed = true;
    result.members = updatedMembers;
  }

  if (
    inviteIndex === -1 &&
    (member.status === 'rejected' || member.status === 'pending')
  ) {
    const updatedInvites = [...invites, member];
    result.changed = true;
    result.invites = updatedInvites;
  } else if (
    inviteIndex !== -1 &&
    (member.status === 'rejected' || member.status === 'pending')
  ) {
    const updatedInvites = [...invites];
    updatedInvites[inviteIndex] = member;
    result.changed = true;
    result.invites = updatedInvites;
  } else if (inviteIndex !== -1) {
    const updatedInvites = [...invites];
    updatedInvites.splice(inviteIndex, 1);
    result.changed = true;
    result.invites = updatedInvites;
  }

  return result;
};

export const removeMemberFromState = (
  member: FeedMember,
  members: FeedMember[],
) => {
  const memberIndex = members.findIndex((m) => m.user?.id === member.user?.id);
  if (memberIndex === -1) {
    return { changed: false, members };
  } else {
    const updatedMembers = [...members];
    updatedMembers.splice(memberIndex, 1);
    return { changed: true, members: updatedMembers };
  }
};
