import { UserIcon, CloseIcon } from "../icons";

interface ProfileDropdownProps {
  userEmail: string | undefined;
  onSignOut: () => void;
  onClose: () => void;
}

export const ProfileDropdown = ({
  userEmail,
  onSignOut,
  onClose,
}: ProfileDropdownProps) => {
  return (
    <div className="relative flex w-64 flex-col items-start justify-start rounded-md border border-[#333] bg-black/40 px-4 py-4 shadow-[4px_4px_32px_0px_#0000001F] backdrop-blur-[32px]">
      <div className="flex w-full items-center justify-between border-bottom border-zinc-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-zinc-400" />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            My Profile
          </span>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer text-zinc-400 hover:text-white transition-colors"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1 w-full mb-6">
        <p className="text-[12px] text-zinc-500 font-semibold uppercase">
          Email
        </p>
        <p className="truncate text-[14px] font-medium text-white">
          {userEmail}
        </p>
      </div>

      <button
        onClick={() => {
          onSignOut();
          onClose();
        }}
        className="w-full rounded-lg bg-red-500/10 py-2.5 text-center text-[14px] font-bold text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
      >
        Sign Out
      </button>
    </div>
  );
};
