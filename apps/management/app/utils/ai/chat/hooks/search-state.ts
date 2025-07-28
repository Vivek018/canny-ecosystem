import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import {
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const placeholders = [
  "Thinking through your request, please hold on",
  "Analyzing everything you just asked for",
  "Generating the best possible response for you",
  "Fetching all the relevant data from our systems",
  "Just a moment while we prepare everything",
  "Working on your request with full focus",
  "Looking into the details to give you an accurate answer",
  "Digging through the data to find what you need",
  "Crunching some serious numbers for this one",
  "Loading up the insights you’re looking for",
  "Compiling the response that matches your request",
  "Pulling up the results — this won’t take long!",
  "Finalizing everything for a smooth output",
  "Almost done — just adding the finishing touches",
  "One sec, wrapping things up neatly for you",
  "Getting things ready — this’ll be worth it!",
  "Still with me? Your answer is coming together now",
  "Formatting the cleanest, clearest response possible",
  "Checking all the latest details before replying",
  "Still cooking that answer — hang tight!",
];

export function useSearchState({
  data,
  config,
  query,
  returnTo,
}: {
  data: any[] | null;
  config: any;
  query: string | null;
  returnTo: string;
}) {
  const [stateData, setStateData] = useState(data ?? []);
  const [stateConfig, setStateConfig] = useState(config);

  const columns = stateData?.[0] ? Object.keys(stateData[0]) : [];

  const animatedPlaceholder = useTypingAnimation(placeholders, false, {
    typingSpeed: 70,
    pauseDuration: 1400,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const searchPrompt = searchParams.get("prompt")?.toString() ?? undefined;

  const [prompt, setPrompt] = useState(searchPrompt);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearSearch = () => {
    setStateData([]);
    setStateConfig(null);
    setPrompt("");
    searchParams.delete("prompt");
    setSearchParams(searchParams);
  };

  const refreshSearch = () => {
    setStateData([]);
    setStateConfig(null);
    setIsSubmitting(true);
    navigate(0);
  };

  useEffect(() => {
    if (data?.length) {
      setStateData(data);
    }
    if (config) {
      setStateConfig(config);
    }
  }, [data, config]);

  useEffect(() => {
    setIsSubmitting(
      navigation.state === "submitting" ||
        (navigation.state === "loading" &&
          navigation.location.pathname.includes("/chat/chatbox") &&
          !!navigation.location.search.length),
    );
  }, [navigation.state]);

  useHotkeys(
    "esc",
    () => {
      clearSearch();
    },
    {
      enableOnFormTags: true,
    },
  );

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setPrompt(value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (prompt !== searchPrompt) {
      setStateData([]);
      setStateConfig(null);
    }
    if (prompt) {
      searchParams.set("prompt", prompt);
      setSearchParams(searchParams);
    }
    setIsSubmitting(false);
  };

  const saveChat = (e: any) => {
    e.preventDefault();

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("prompt", searchPrompt ?? "");
    formData.append("query", query ?? "");
    formData.append("config", stateConfig ? JSON.stringify(stateConfig) : "");
    formData.append("returnTo", returnTo);

    submit(formData, {
      action: "/chat/chatbox",
      method: "POST",
    });

    setStateData([]);
    setStateConfig(null);
    setPrompt("");
    setIsSubmitting(false);
  };

  return {
    stateData,
    stateConfig,
    columns,
    prompt,
    setPrompt,
    searchPrompt,
    inputRef,
    isSubmitting,
    animatedPlaceholder,
    handleSubmit,
    handleSearch,
    saveChat,
    clearSearch,
    refreshSearch,
  };
}
