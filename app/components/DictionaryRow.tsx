interface DictionaryRowProps {
  word: string;
  definition: string;
  commentCount: number;
}

export default function DictionaryRow({ word, definition, commentCount }: DictionaryRowProps) {
  return (
    <div className="w-full bg-white border border-black rounded-xl p-4 mb-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="text-black font-bold text-lg lowercase m-0 leading-none mb-1">{word}</h3>
        <p className="text-gray-500 text-xs italic lowercase whitespace-nowrap overflow-hidden text-ellipsis m-0">
          {definition}
        </p>
      </div>
      
      {commentCount > 0 && (
        <div className="flex items-center text-xs font-bold bg-[#F5F5DC] border border-black rounded-full px-2 py-1">
          <span className="mr-1">💬</span> {commentCount}
        </div>
      )}
    </div>
  );
}