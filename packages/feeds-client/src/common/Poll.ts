import { StateStore } from '@stream-io/state-store';
import type { FeedsClient } from '../feeds-client';
import type {
  PollVoteResponseData,
  QueryPollVotesRequest,
  PollUpdatedFeedEvent,
  WSEvent,
  PollClosedFeedEvent,
  PollVoteCastedFeedEvent,
  PollVoteChangedFeedEvent,
  PollVoteRemovedFeedEvent,
  PollResponseData,
} from '../gen/models';

const isPollUpdatedEvent = (
  e: WSEvent,
): e is { type: 'feeds.poll.updated' } & PollUpdatedFeedEvent =>
  e.type === 'feeds.poll.updated';
const isPollClosedEventEvent = (
  e: WSEvent,
): e is { type: 'feeds.poll.closed' } & PollClosedFeedEvent =>
  e.type === 'feeds.poll.closed';
const isPollVoteCastedEvent = (
  e: WSEvent,
): e is { type: 'feeds.poll.vote_casted' } & PollVoteCastedFeedEvent =>
  e.type === 'feeds.poll.vote_casted';
const isPollVoteChangedEvent = (
  e: WSEvent,
): e is { type: 'feeds.poll.vote_changed' } & PollVoteChangedFeedEvent =>
  e.type === 'feeds.poll.vote_changed';
const isPollVoteRemovedEvent = (
  e: WSEvent,
): e is { type: 'feeds.poll.vote_removed' } & PollVoteRemovedFeedEvent =>
  e.type === 'feeds.poll.vote_removed';

export const isVoteAnswer = (vote: PollVoteResponseData) =>
  !!vote?.answer_text;

export type PollAnswersQueryParams = QueryPollVotesRequest & {
  poll_id: string;
  user_id?: string;
};

type OptionId = string;

export type PollState = Omit<PollResponseData, 'own_votes' | 'id'> & {
  last_activity_at: Date;
  max_voted_option_ids: OptionId[];
  own_votes_by_option_id: Record<OptionId, PollVoteResponseData>;
  own_answer?: PollVoteResponseData; // each user can have only one answer
};

type PollInitOptions = {
  client: FeedsClient;
  poll: PollResponseData;
};

export class StreamPoll {
  public readonly state: StateStore<PollState>;
  public id: string;
  private readonly client: FeedsClient;

  constructor({ client, poll }: PollInitOptions) {
    this.client = client;
    this.id = poll.id;

    this.state = new StateStore<PollState>(
      this.getInitialStateFromPollResponse(poll),
    );
  }

  private readonly getInitialStateFromPollResponse = (
    poll: PollInitOptions['poll'],
  ) => {
    const { own_votes, id, ...pollResponseForState } = poll;
    const { ownAnswer, ownVotes } = own_votes?.reduce<{
      ownVotes: PollVoteResponseData[];
      ownAnswer?: PollVoteResponseData;
    }>(
      (acc, voteOrAnswer) => {
        if (isVoteAnswer(voteOrAnswer)) {
          acc.ownAnswer = voteOrAnswer;
        } else {
          acc.ownVotes.push(voteOrAnswer);
        }
        return acc;
      },
      { ownVotes: [] },
    ) ?? { ownVotes: [] };

    return {
      ...pollResponseForState,
      last_activity_at: new Date(),
      max_voted_option_ids: getMaxVotedOptionIds(
        pollResponseForState.vote_counts_by_option,
      ),
      own_answer: ownAnswer,
      own_votes_by_option_id: getOwnVotesByOptionId(ownVotes),
    };
  };

  public reinitializeState = (poll: PollInitOptions['poll']) => {
    this.state.partialNext(this.getInitialStateFromPollResponse(poll));
  };

  get data(): PollState {
    return this.state.getLatestValue();
  }

  public handlePollUpdated = (event: PollUpdatedFeedEvent) => {
    if (event.poll?.id && event.poll.id !== this.id) return;
    if (!isPollUpdatedEvent(event as WSEvent)) return;
    const { id, ...pollData } = event.poll;
    this.state.partialNext({
      ...pollData,
      last_activity_at: new Date(event.created_at),
    });
  };

  public handlePollClosed = (event: PollClosedFeedEvent) => {
    if (event.poll?.id && event.poll.id !== this.id) return;
    if (!isPollClosedEventEvent(event as WSEvent)) return;
    this.state.partialNext({
      is_closed: true,
      last_activity_at: new Date(event.created_at),
    });
  };

  public handleVoteCasted = (event: PollVoteCastedFeedEvent) => {
    if (event.poll?.id && event.poll.id !== this.id) return;
    if (!isPollVoteCastedEvent(event as WSEvent)) return;
    const currentState = this.data;
    const isOwnVote =
      event.poll_vote.user_id ===
      this.client.state.getLatestValue().connected_user?.id;
    let latestAnswers = [...currentState.latest_answers];
    let ownAnswer = currentState.own_answer;
    let ownVotesByOptionId = currentState.own_votes_by_option_id;
    let maxVotedOptionIds = currentState.max_voted_option_ids;

    if (isOwnVote) {
      if (isVoteAnswer(event.poll_vote)) {
        ownAnswer = event.poll_vote;
      } else if (event.poll_vote.option_id) {
        ownVotesByOptionId = {
          ...ownVotesByOptionId,
          [event.poll_vote.option_id]: event.poll_vote,
        };
      }
    }

    if (isVoteAnswer(event.poll_vote)) {
      latestAnswers = [event.poll_vote, ...latestAnswers];
    } else {
      maxVotedOptionIds = getMaxVotedOptionIds(
        event.poll.vote_counts_by_option,
      );
    }

    const {
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
    } = event.poll;
    this.state.partialNext({
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
      latest_answers: latestAnswers,
      last_activity_at: new Date(event.created_at),
      own_answer: ownAnswer,
      own_votes_by_option_id: ownVotesByOptionId,
      max_voted_option_ids: maxVotedOptionIds,
    });
  };

  public handleVoteChanged = (event: PollVoteChangedFeedEvent) => {
    // this event is triggered only when event.poll.enforce_unique_vote === true
    if (event.poll?.id && event.poll.id !== this.id) return;
    if (!isPollVoteChangedEvent(event as WSEvent)) return;
    const currentState = this.data;
    const isOwnVote =
      event.poll_vote.user_id ===
      this.client.state.getLatestValue().connected_user?.id;
    let latestAnswers = [...currentState.latest_answers];
    let ownAnswer = currentState.own_answer;
    let ownVotesByOptionId = currentState.own_votes_by_option_id;
    let maxVotedOptionIds = currentState.max_voted_option_ids;

    if (isOwnVote) {
      if (isVoteAnswer(event.poll_vote)) {
        latestAnswers = [
          event.poll_vote,
          ...latestAnswers.filter((answer) => answer.id !== event.poll_vote.id),
        ];
        ownAnswer = event.poll_vote;
      } else if (event.poll_vote.option_id) {
        if (event.poll.enforce_unique_vote) {
          ownVotesByOptionId = { [event.poll_vote.option_id]: event.poll_vote };
        } else {
          ownVotesByOptionId = Object.entries(ownVotesByOptionId).reduce<
            Record<OptionId, PollVoteResponseData>
          >((acc, [optionId, vote]) => {
            if (
              optionId !== event.poll_vote.option_id &&
              vote.id === event.poll_vote.id
            ) {
              return acc;
            }
            acc[optionId] = vote;
            return acc;
          }, {});
          ownVotesByOptionId[event.poll_vote.option_id] = event.poll_vote;
        }

        if (ownAnswer?.id === event.poll_vote.id) {
          ownAnswer = undefined;
        }
        maxVotedOptionIds = getMaxVotedOptionIds(
          event.poll.vote_counts_by_option,
        );
      }
    } else if (isVoteAnswer(event.poll_vote)) {
      latestAnswers = [event.poll_vote, ...latestAnswers];
    } else {
      maxVotedOptionIds = getMaxVotedOptionIds(
        event.poll.vote_counts_by_option,
      );
    }

    const {
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
    } = event.poll;
    this.state.partialNext({
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
      latest_answers: latestAnswers,
      last_activity_at: new Date(event.created_at),
      own_answer: ownAnswer,
      own_votes_by_option_id: ownVotesByOptionId,
      max_voted_option_ids: maxVotedOptionIds,
    });
  };

  public handleVoteRemoved = (event: PollVoteRemovedFeedEvent) => {
    if (event.poll?.id && event.poll.id !== this.id) return;
    if (!isPollVoteRemovedEvent(event as WSEvent)) return;
    const currentState = this.data;
    const isOwnVote =
      event.poll_vote.user_id ===
      this.client.state.getLatestValue().connected_user?.id;
    let latestAnswers = [...currentState.latest_answers];
    let ownAnswer = currentState.own_answer;
    const ownVotesByOptionId = { ...currentState.own_votes_by_option_id };
    let maxVotedOptionIds = currentState.max_voted_option_ids;

    if (isVoteAnswer(event.poll_vote)) {
      latestAnswers = latestAnswers.filter(
        (answer) => answer.id !== event.poll_vote.id,
      );
      if (isOwnVote) {
        ownAnswer = undefined;
      }
    } else {
      maxVotedOptionIds = getMaxVotedOptionIds(
        event.poll.vote_counts_by_option,
      );
      if (isOwnVote && event.poll_vote.option_id) {
        delete ownVotesByOptionId[event.poll_vote.option_id];
      }
    }

    const {
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
    } = event.poll;
    this.state.partialNext({
      answers_count,
      latest_votes_by_option,
      vote_count,
      vote_counts_by_option,
      latest_answers: latestAnswers,
      last_activity_at: new Date(event.created_at),
      own_answer: ownAnswer,
      own_votes_by_option_id: ownVotesByOptionId,
      max_voted_option_ids: maxVotedOptionIds,
    });
  };
}

function getMaxVotedOptionIds(
  voteCountsByOption: PollResponseData['vote_counts_by_option'],
) {
  let maxVotes = 0;
  let winningOptions: string[] = [];
  for (const [id, count] of Object.entries(voteCountsByOption ?? {})) {
    if (count > maxVotes) {
      winningOptions = [id];
      maxVotes = count;
    } else if (count === maxVotes) {
      winningOptions.push(id);
    }
  }
  return winningOptions;
}

function getOwnVotesByOptionId(ownVotes: PollVoteResponseData[]) {
  return !ownVotes
    ? ({} satisfies Record<OptionId, PollVoteResponseData>)
    : ownVotes.reduce<Record<OptionId, PollVoteResponseData>>((acc, vote) => {
        if (isVoteAnswer(vote) || !vote.option_id) return acc;
        acc[vote.option_id] = vote;
        return acc;
      }, {});
}
