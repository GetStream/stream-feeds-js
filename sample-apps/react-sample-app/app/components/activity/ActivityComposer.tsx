export function ActivityComposer({
  text,
  onChange,
}: {
  text: string;
  onChange?: (activityText: string) => void;
}) {
  return (
    <div className="w-full">
      <textarea
        id="question"
        name="question"
        value={[text]}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        rows={5}
        placeholder="Write something..."
        className="w-full p-3 border border-gray-300 rounded-md resize-none"
      />
    </div>
  );
}
