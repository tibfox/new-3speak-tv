import React, { useEffect } from 'react'
import "./FirstUploads.scss"
import { useQuery } from '@apollo/client';
import { FIRST_UPLOAD_FEED } from '../graphql/queries'
import Cards from "../components/Cards/Cards"
import CardSkeleton from "../components/Cards/CardSkeleton";
import axios from 'axios'
import Card3 from '../components/Cards/Card3';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `https://3speak.tv/apiv2/feeds/firstUploads?page=${pageParam}`
  );
  return res.data;
};
const FirstUploads = () => {

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

 

  console.log(videos)
  return (
    <div className='firstupload-container'>
        <div className='headers'>FIRST TIME UPLOADS</div>
        {isLoading ? <CardSkeleton /> :  <Card3 videos={videos} loading={isFetchingNextPage} />}
    {isError && <p>Error fetching videos</p>}
      {isFetchingNextPage && (
        <p style={{ textAlign: "center" }}>Loading more...</p>
      )}

    </div>
  )
}

export default FirstUploads