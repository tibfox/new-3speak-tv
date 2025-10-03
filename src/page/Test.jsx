import axios from "axios";
import React, { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Card3 from "../components/Cards/Card3";
import CardSkeleton from "../components/Cards/CardSkeleton";

const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `https://3speak.tv/apiv2/feeds/@kesolink?page=${pageParam}`
  );
  return res.data;
};

function Test() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,     
  } = useInfiniteQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has data, increment page
      if (lastPage.length > 0) return allPages.length + 1;
      return undefined; // stop fetching
    },
  });

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !isFetchingNextPage &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Flatten all pages into a single array
  const videos = data?.pages.flat() || [];

  return (
    <div>
      {isLoading ? <CardSkeleton /> :  <Card3 videos={videos} loading={isFetchingNextPage} />}
      {isError && <p>Error fetching videos</p>}

      

      {isFetchingNextPage && (
        <p style={{ textAlign: "center" }}>Loading more...</p>
      )}
      {/* {!hasNextPage && (
        <p style={{ textAlign: "center" }}>No more videos</p>
      )} */}
    </div>
  );
}

export default Test;
