import { Trophy, Medal } from "lucide-react";

type Props = {
  leaderboard: {
    id: string;
    name: string;
    points: number;
  }[];
  onContinue: () => void;
};

export default function LeaderboardModal({
  leaderboard,
  onContinue,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border-4 border-black bg-[#FFF8E7] p-6 shadow-[12px_12px_0px_black]">

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-[#FFD54A]">
            <Trophy size={40} />
          </div>

          <h2 className="text-4xl font-black">
            Game Over!
          </h2>

          <p className="mt-2 font-bold text-gray-500">
            Final Leaderboard
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {leaderboard.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-2xl border-4 border-black bg-white px-5 py-4"
            >
              <div className="flex items-center gap-3">
                {index === 0 ? (
                  <Trophy className="text-yellow-500" />
                ) : (
                  <Medal />
                )}

                <div>
                  <p className="font-black text-lg">
                    #{index + 1} {player.name}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border-3 border-black bg-[#FFD54A] px-4 py-2 font-black">
                {player.points} pts
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-2xl border-4 border-black bg-[#FFD54A] px-6 py-4 text-xl font-black shadow-[6px_6px_0px_black] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] active:translate-y-1 active:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}