/** 周易六爻卦象图标（六横） */
export default function HexagramIconMini({ className = "" }: { className?: string }) {
  const lines = [true, false, true, true, false, true];

  return (
    <div className={`flex flex-col items-center justify-center gap-[3px] ${className}`}>
      {[...lines].reverse().map((yang, i) => (
        <div key={i} className="flex h-[3px] w-5 items-center justify-center gap-[3px]">
          {yang ? (
            <div className="h-full w-full rounded-[1px] bg-current" />
          ) : (
            <>
              <div className="h-full w-[8px] rounded-[1px] bg-current" />
              <div className="h-full w-[8px] rounded-[1px] bg-current" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
