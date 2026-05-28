import type { Player } from "../utils/types";
import Avatar from "./Avatar";

type Props = {
  players: Player[];
  drawerId: string;
  myId: string;
};

const PlayerList: React.FC<Props> = ({
  players,
  drawerId,
  myId,
}) => {
  const sorted = [...players].sort(
    (a, b) => b.points - a.points
  );

  return (
    <div className="
      h-full
      flex
      flex-col
      bg-white
      rounded-[24px]
      border
      border-[#E9ECEF]
      overflow-hidden
    ">

      {/* HEADER */}
      <div className="
        px-5
        py-4
        border-b
        border-[#E9ECEF]
        bg-[#FFFDF7]
      ">
        <p className="font-semibold text-[#2B2B2B]">
          Players
        </p>
      </div>

      {/* LIST */}
      <div className="
        flex-1
        overflow-y-auto
        px-2
        py-2
      ">

        {sorted.map((player, idx) => {
          const isMe = player.id === myId;

          const isDrawing =
            player.id === drawerId;

          return (
            <div
              key={player.id}
              className={`
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-2xl
                transition-colors
                ${
                  isMe
                    ? "bg-[#FFF4E6]"
                    : "hover:bg-[#F8F9FA]"
                }
              `}
            >

              {/* RANK */}
              <div className="
                w-6
                text-center
                text-sm
                font-semibold
                text-[#ADB5BD]
              ">
                {idx + 1}
              </div>

              {/* AVATAR */}
              <Avatar
                name={player.name}
                size={38}
                isDrawer={isDrawing}
              />

              {/* INFO */}
              <div className="
                flex-1
                min-w-0
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <p className="
                    text-sm
                    font-semibold
                    text-[#2B2B2B]
                    truncate
                  ">
                    {player.name}
                  </p>

                  {isMe && (
                    <span className="
                      text-[11px]
                      font-medium
                      text-[#F4A261]
                    ">
                      you
                    </span>
                  )}
                </div>

                {isDrawing && (
                  <p className="
                    text-xs
                    text-[#868E96]
                    mt-0.5
                  ">
                    drawing...
                  </p>
                )}
              </div>

              {/* POINTS */}
              <div className="
                text-sm
                font-semibold
                text-[#F4A261]
              ">
                {player.points}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;