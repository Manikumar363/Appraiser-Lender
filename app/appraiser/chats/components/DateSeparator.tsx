// Create file: chats/[id]/components/DateSeparator.tsx
interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
        {date}
      </div>
    </div>
  );
};

export default DateSeparator;
