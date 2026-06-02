"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Search } from "lucide-react";
import { toast } from "sonner";

import { ISelectedMember } from "@/components/page/church/member/container";
import ChurchMemberItem from "@/components/page/church/member/item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import EmptySection from "@/components/ui/empty-section";
import InputSearch from "@/components/ui/input-search";
import LoadingSection from "@/components/ui/loading-section";
import { useDebounce } from "@/hooks/use-debounce";
import { getUsersNotChurched } from "@/service/user";
import { IUser } from "@/types/user";

interface IModalAddMemberProps {
  open: boolean;
  members: string[];
  onOpenChange: (open: boolean) => void;
  onAdd: (selectedMembers: ISelectedMember[]) => void;
}

const ChurchModalAddMember = ({
  open,
  members: memberFormValues,
  onAdd,
  onOpenChange,
}: IModalAddMemberProps) => {
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
    try {
      setIsLoading(true);
      const { data } = await getUsersNotChurched({
        search: debouncedSearch,
        excludeId: memberFormValues,
      });
      setMembers(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, memberFormValues]);

  const onAddMember = useCallback(() => {
    onAdd(selectedMembers);
  }, [onAdd, selectedMembers]);

  useEffect(() => {
    fetchChurchUsers();
  }, [fetchChurchUsers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <DialogHeader
          title="Add Member"
          description="Search the congregation directory to add members to the church."
        >
          <InputSearch
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </DialogHeader>

        <div className="border-t border-gray-100">
          <div className="max-h-[50vh] overflow-y-auto px-4 py-5 custom-scrollbar bg-white">
            <div className="space-y-2">
              {isLoading ? (
                <LoadingSection />
              ) : members.length === 0 ? (
                <EmptySection
                  icon={Search}
                  message={`No results found for "${search}"`}
                />
              ) : (
                members.map((member) => (
                  <ChurchMemberItem
                    key={member.id}
                    member={member}
                    isSelected={
                      !!selectedMembers.find((i) => i.id === member.id)
                        ?.selected
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
    </Dialog>
  );
};

export default ChurchModalAddMember;
