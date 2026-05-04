"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Search } from "lucide-react";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import MemberItem, {
  ISelectedMember,
} from "@/components/page/cool/member-item";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import InputSearch from "@/components/ui/input-search";
import LoadingSection from "@/components/ui/loading-section";
import { useDebounce } from "@/hooks/use-debounce";
import { getChurchUsers } from "@/service/church";
import userStore from "@/store/user";
import { IUser } from "@/types/user";

interface IModalAddMemberProps {
  members: ISelectedMember[];
  onAdd: (selectedMembers: ISelectedMember[]) => void;
}

const ModalAddMember = ({
  members: memberFormValues,
  onAdd,
}: IModalAddMemberProps) => {
  const { user } = useSnapshot(userStore);
  const [members, setMembers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ISelectedMember[]>([]);

  const toggleMember = useCallback((selected: ISelectedMember) => {
    setSelectedMembers((prev) =>
      prev.find((i) => i.id === selected.id)
        ? prev.filter((i) => i !== selected)
        : [...prev, selected]
    );
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  const fetchChurchUsers = useCallback(async () => {
    if (!user?.church_user?.church_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await getChurchUsers({
        church_id: user.church_user.church_id,
        search: debouncedSearch,
      });
      if (error) throw new Error("Failed to fetch church users");
      setMembers(
        data
          ?.filter((d) => !memberFormValues.find((m) => m.id === d.user?.id))
          .map((d) => d.user!) || []
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, memberFormValues, user?.church_user?.church_id]);

  const onAddMember = useCallback(() => {
    console.log(selectedMembers);

    onAdd(selectedMembers);
  }, [onAdd, selectedMembers]);

  useEffect(() => {
    fetchChurchUsers();
  }, [fetchChurchUsers]);

  return (
    <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
      <DialogHeader
        title="Add Member"
        description="Search the congregation directory to add members to COOL."
      >
        <InputSearch
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </DialogHeader>

      <div className="border-t border-gray-100">
        <div className="max-h-[380px] overflow-y-auto px-4 py-5 custom-scrollbar bg-white">
          <div className="space-y-2">
            {isLoading ? (
              <LoadingSection />
            ) : members.length === 0 ? (
              <div className="py-16 text-center animate-in fade-in duration-500">
                <div className="bg-gray-50 rounded-full size-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="size-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">
                  No results found for &quot;{search}&quot;
                </p>
              </div>
            ) : (
              members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isSelected={
                    !!selectedMembers.find((i) => i.id === member.id)?.selected
                  }
                  onToggle={(selected) => toggleMember(selected)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" size="md">
            Cancel
          </Button>
        </DialogClose>
        <Button
          size="md"
          disabled={selectedMembers.length === 0}
          onClick={onAddMember}
        >
          Add Selected Members
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalAddMember;
