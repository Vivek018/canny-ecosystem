import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { formatISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  type SubmitOptions,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { Calendar } from "@canny_ecosystem/ui/calendar";
import {
  assignmentTypeArray,
  educationArray,
  genderArray,
  positionArray,
  replaceUnderscore,
  skillLevelArray,
} from "@canny_ecosystem/utils";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";

const PLACEHOLDERS = [
  "Employees joined after Jan 2020 with a supervisor position",
  "Active employees with a bachelor's degree at Project Site 'B'",
  "Skilled employees left between 2022-2024 as a contractor",
  "Male employees born after 1990 working as Sampler",
  "Inactive employees in Project A who left before 2023",
  "Semi Skilled Employees born 1990-2000 in full time",
  "Employees joined before 2015",
  "Active employees in part time roles at Site 'C'",
  "Employees left after 2022 with semi skilled skills",
  "Employees in Project 'X' born before 1985",
  "Employees joined before 2018 in Sampler role",
  "Employees born before 1995 who worked at Site 'B'",
  "Employees joined in 2019 in supervisor role",
  "Full-time employees at Project Site 'B'",
];

export function EmployeesSearchFilter({
  disabled,
  projectArray,
  projectSiteArray,
}: {
  disabled?: boolean;
  projectArray: string[];
  projectSiteArray: string[];
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/employees" &&
      navigation.location.search.length);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: EmployeeFilters = {
    dob_start: "",
    dob_end: "",
    education: "",
    gender: "",
    status: "",
    project: "",
    project_site: "",
    assignment_type: "",
    position: "",
    skill_level: "",
    doj_start: "",
    doj_end: "",
    dol_start: "",
    dol_end: "",
  };

  const [filterParams, setFilterParams] = useState(initialFilterParams);

  const submit = useSubmit();
  const debounceSubmit = useDebounce((target: any, options?: SubmitOptions) => {
    submit(target, options);
  }, 300);

  const animatedPlaceholder = useTypingAnimation(PLACEHOLDERS, isFocused, {
    typingSpeed: 40,
    pauseDuration: 4000,
  });

  const deleteAllSearchParams = () => {
    for (const [key, _val] of Object.entries(filterParams)) {
      searchParams.delete(key);
    }
    searchParams.delete("name");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.set(key, value);
      }
      setSearchParams(searchParams);
    }
  }, [filterParams]);

  const searchParamsList: EmployeeFilters = {
    dob_start: searchParams.get("dob_start"),
    dob_end: searchParams.get("dob_end"),
    education: searchParams.get("education"),
    gender: searchParams.get("gender"),
    status: searchParams.get("status"),
    project: searchParams.get("project"),
    project_site: searchParams.get("project_site"),
    assignment_type: searchParams.get("assignment_type"),
    position: searchParams.get("position"),
    skill_level: searchParams.get("skill_level"),
    doj_start: searchParams.get("doj_start"),
    doj_end: searchParams.get("doj_end"),
    dol_start: searchParams.get("dol_start"),
    dol_end: searchParams.get("dol_end"),
  };

  useEffect(() => {
    for (const [key, value] of Object.entries(searchParamsList)) {
      if (value === null || value === undefined || !String(value)?.length) {
        setFilterParams((prev) => ({ ...prev, [key]: "" }));
      }
    }
  }, [searchParams]);

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      deleteAllSearchParams();
      setFilterParams(initialFilterParams);
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
    }
  );

  useHotkeys(["meta+s", "ctrl+s"], (evt) => {
    if (!disabled) {
      evt.preventDefault();
      inputRef.current?.focus();
    }
  });

  useHotkeys(["meta+f", "ctrl+f"], (evt) => {
    if (!disabled) {
      evt.preventDefault();
      setIsOpen((prev) => !prev);
    }
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    if (value) {
      setPrompt(value);
    } else {
      deleteAllSearchParams();
      setFilterParams(initialFilterParams);
      setPrompt("");
    }
  };

  const handleSubmit = () => {
    if (prompt.split(" ").length > 1) {
      debounceSubmit(
        { prompt: prompt },
        {
          action: "/employees?index",
          method: "POST",
        }
      );
    } else {
      if (prompt.length) {
        searchParams.set("name", prompt);
        setSearchParams(searchParams);
      }
    }
  };

  const hasValidFilters =
    Object.entries(filterParams).filter(
      ([key, value]) => value?.length && key !== "name"
    ).length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className='flex space-x-4 w-full md:w-auto items-center'>
        <form
          className='relative w-full md:w-auto'
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icon
            name={isSubmitting ? "update" : "search"}
            className={cn(
              "absolute pointer-events-none left-3 top-[12.5px]",
              isSubmitting && "animate-spin"
            )}
          />
          <Input
            tabIndex={-1}
            ref={inputRef}
            placeholder={
              disabled
                ? "No Employee Data to Search And Filter"
                : animatedPlaceholder
            }
            disabled={disabled}
            className='pl-9 w-full h-10 md:w-[480px] pr-8 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70'
            value={prompt}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete='on'
            autoCapitalize='none'
            autoCorrect='off'
            spellCheck='false'
          />

          <DropdownMenuTrigger disabled={disabled} asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type='button'
              disabled={disabled}
              className={cn(
                "absolute z-10 right-3 top-[6px] opacity-70",
                !disabled &&
                  "transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100"
              )}
            >
              <Icon name='mixer' />
            </button>
          </DropdownMenuTrigger>
        </form>
      </div>

      <DropdownMenuContent
        className='w-full md:w-[480px]'
        align='end'
        sideOffset={19}
        alignOffset={-11}
        side='top'
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Date of birth</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                <Calendar
                  mode='range'
                  today={
                    filterParams.dob_start
                      ? new Date(filterParams.dob_start)
                      : new Date()
                  }
                  
                  max={new Date().getDate()}
                  selected={
                    {
                      from:
                        filterParams.dob_start &&
                        new Date(filterParams.dob_start).toISOString(),
                      to:
                        filterParams.dob_end && new Date(filterParams.dob_end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      dob_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.dob_start),
                      dob_end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : "",
                    };
                    setFilterParams((prev) => ({ ...prev, ...newRange }));
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Education</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {educationArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.education === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        education: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Gender</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {genderArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.gender === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        gender: name,
                      }));
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {["active", "inactive"].map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.status === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        status: name,
                      }));
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Project</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {projectArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.project === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        project: name,
                      }));
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Project Site</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {!searchParamsList.project ? (
                  <DropdownMenuCheckboxItem
                    disabled={true}
                    className='p-8 items-center justify-center'
                  >
                    Select Project First
                  </DropdownMenuCheckboxItem>
                ) : (
                  projectSiteArray?.map((name, index) => (
                    <DropdownMenuCheckboxItem
                      key={name + index.toString()}
                      className='capitalize'
                      checked={filterParams?.project_site === name}
                      onCheckedChange={() => {
                        setFilterParams((prev) => ({
                          ...prev,
                          project_site: name,
                        }));
                      }}
                    >
                      {name}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Assignment Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {assignmentTypeArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.assignment_type === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        assignment_type: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Position</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {positionArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.position === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        position: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Skill Level</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                {skillLevelArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className='capitalize'
                    checked={filterParams?.skill_level === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        skill_level: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Date of joining</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                <Calendar
                  mode='range'
                  initialFocus
                  today={
                    filterParams.doj_start
                      ? new Date(filterParams.doj_start)
                      : new Date()
                  }
                  toDate={new Date()}
                  selected={
                    {
                      from:
                        filterParams.doj_start &&
                        new Date(filterParams.doj_start).toISOString(),
                      to:
                        filterParams.doj_end && new Date(filterParams.doj_end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      doj_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.doj_start),
                      doj_end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : "",
                    };
                    setFilterParams((prev) => ({ ...prev, ...newRange }));
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Date of leaving</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className='p-0'
              >
                <Calendar
                  mode='range'
                  initialFocus
                  today={
                    filterParams.dol_start
                      ? new Date(filterParams.dol_start)
                      : new Date()
                  }
                  toDate={new Date()}
                  selected={
                    {
                      from:
                        filterParams.dol_start &&
                        new Date(filterParams.dol_start).toISOString(),
                      to:
                        filterParams.dol_end && new Date(filterParams.dol_end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      dol_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.dol_start),
                      dol_end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : "",
                    };
                    setFilterParams((prev) => ({ ...prev, ...newRange }));
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
