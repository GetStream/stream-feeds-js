import { useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export type PollData = {
  name: string;
  options: string[];
  enforce_unique_vote: boolean;
  description: string;
  allow_user_suggested_options: boolean;
};

export type PollComposerModalHandle = {
  open: () => void;
  close: () => void;
};

type PollComposerModalProps = {
  onSubmit: (pollData: PollData) => void;
  onCancel?: () => void;
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export const PollComposerModal = forwardRef<PollComposerModalHandle, PollComposerModalProps>(
  ({ onSubmit, onCancel }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
    const [allowUserSuggestedOptions, setAllowUserSuggestedOptions] = useState(false);

    const resetForm = useCallback(() => {
      setQuestion('');
      setDescription('');
      setOptions(['', '']);
      setAllowMultipleVotes(false);
      setAllowUserSuggestedOptions(false);
    }, []);

    const open = useCallback(() => {
      dialogRef.current?.showModal();
    }, []);

    const close = useCallback(() => {
      dialogRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const handleClose = useCallback(() => {
      resetForm();
      onCancel?.();
    }, [resetForm, onCancel]);

    const handleAddOption = useCallback(() => {
      if (options.length < MAX_OPTIONS) {
        setOptions([...options, '']);
      }
    }, [options]);

    const handleRemoveOption = useCallback((index: number) => {
      if (options.length > MIN_OPTIONS) {
        setOptions(options.filter((_, i) => i !== index));
      }
    }, [options]);

    const handleOptionChange = useCallback((index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    }, [options]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();

      const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);

      if (!question.trim() || trimmedOptions.length < MIN_OPTIONS) {
        return;
      }

      const pollData: PollData = {
        name: question.trim(),
        options: trimmedOptions,
        enforce_unique_vote: !allowMultipleVotes,
        description: description.trim(),
        allow_user_suggested_options: allowUserSuggestedOptions,
      };

      onSubmit(pollData);
      resetForm();
      close();
    }, [question, description, options, allowMultipleVotes, allowUserSuggestedOptions, onSubmit, resetForm, close]);

    const handleCancel = useCallback(() => {
      resetForm();
      close();
      onCancel?.();
    }, [resetForm, close, onCancel]);

    const filledOptionsCount = options.filter(opt => opt.trim().length > 0).length;
    const isValid = question.trim().length > 0 && filledOptionsCount >= MIN_OPTIONS;
    const canAddOption = options.length < MAX_OPTIONS;
    const canRemoveOption = options.length > MIN_OPTIONS;

    return (
      <dialog ref={dialogRef} className="modal" onClose={handleClose}>
        <div className="modal-box w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">ballot</span>
              <h3 className="font-semibold text-lg">Create Poll</h3>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleCancel}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Question</span>
              </label>
              <input
                type="text"
                placeholder="Ask a question..."
                className="input input-bordered w-full"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description <span className="font-normal text-base-content/70">(optional)</span></span>
              </label>
              <textarea
                placeholder="Add a description..."
                className="textarea textarea-bordered w-full"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Options</span>
                <span className="label-text-alt text-base-content/60">
                  {options.length}/{MAX_OPTIONS}
                </span>
              </label>
              <div className="flex flex-col gap-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className="input input-bordered flex-1"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {canRemoveOption && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square text-error"
                        onClick={() => handleRemoveOption(index)}
                        aria-label={`Remove option ${index + 1}`}
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canAddOption && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-2 self-start"
                  onClick={handleAddOption}
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Add option
                </button>
              )}
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={allowMultipleVotes}
                  onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                />
                <span className="label-text">Allow multiple votes</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={allowUserSuggestedOptions}
                  onChange={(e) => setAllowUserSuggestedOptions(e.target.checked)}
                />
                <span className="label-text">Allow voters to suggest options</span>
              </label>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isValid}
              >
                Create Poll
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  }
);

PollComposerModal.displayName = 'PollComposerModal';
